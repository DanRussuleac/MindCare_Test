import { pool } from './db.js';
import dayjs from 'dayjs';
import { OpenAI } from 'openai';

export const analyzeSleepData = async (req, res) => {
  try {
    const userId = req.userId;
    const { range = 7 } = req.body; 

    // 1) Fetch the user’s sleep_entries from the last N days
    const startDate = dayjs().subtract(range, 'day').format('YYYY-MM-DD');
    const query = `
      SELECT * 
      FROM sleep_entries
      WHERE user_id = $1
        AND start_time >= $2
      ORDER BY start_time ASC;
    `;
    const result = await pool.query(query, [userId, startDate]);

    const entries = result.rows;
    if (entries.length === 0) {
      return res.status(200).json({
        analysis: 'No recent sleep data to analyze.',
        suggestions: 'Try logging more sleep entries!',
      });
    }

    // 2) Generate some summary stats server-side
    let totalHours = 0;
    entries.forEach(e => {
      totalHours += Number(e.duration_hours);
    });
    const avgSleep = (totalHours / entries.length).toFixed(2);

    const summaryText = `
      Analyzed your sleep for the last ${range} days.
      You have ${entries.length} entries with an average of ${avgSleep} hours per night.
    `.trim();

    // 3) Now call the AI to get suggestions or deeper analysis
    //    We'll just reuse the same API from your /api/bot
    //    but pass it our own system prompt + summary

    const api = new OpenAI({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.aimlapi.com/v1',
    });

    // Build the message chain
    const messages = [
      {
        role: 'system',
        content: `You are an AI sleep coach with advanced knowledge of sleep science. Provide detailed insights.`,
      },
      {
        role: 'user',
        content: `
        Here is the user's sleep summary:\n
        ${summaryText}\n
        Please analyze their sleep pattern and suggest improvements.
        `,
      },
    ];

    const completion = await api.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      timeout: 10000,
    });

    const aiResponse = completion.choices[0].message.content || '';
    // Example: parse out “analysis” vs “suggestions” from AI if we like

    // 4) Store the results in `sleep_analysis`
    const insertQuery = `
      INSERT INTO sleep_analysis (user_id, analysis_date, analysis_text, suggestions)
      VALUES ($1, CURRENT_DATE, $2, $3)
      RETURNING *;
    `;
    const insertValues = [userId, summaryText, aiResponse];
    const inserted = await pool.query(insertQuery, insertValues);

    // 5) Return the analysis to the user
    res.json({
      analysis: summaryText,
      suggestions: aiResponse,
      record: inserted.rows[0],
    });
  } catch (error) {
    console.error('Error analyzing sleep data:', error);
    res.status(500).json({
      error: 'Failed to analyze sleep data.'
    });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT * FROM sleep_analysis
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history.' });
  }
};
