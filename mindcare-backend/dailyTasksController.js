import { pool } from './db.js';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
// Import the same OpenAI library used in your server
import { OpenAI } from 'openai';

dotenv.config();

// GET daily tasks (for a given date or default today)
export const getDailyTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;
    const targetDate = date || dayjs().format('YYYY-MM-DD');

    const query = `
      SELECT *
      FROM daily_tasks
      WHERE user_id = $1
        AND date = $2
      ORDER BY created_at ASC;
    `;
    const { rows } = await pool.query(query, [userId, targetDate]);
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch daily tasks.' });
  }
};

// CREATE a daily task
export const createDailyTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, content } = req.body;
    const taskDate = date || dayjs().format('YYYY-MM-DD');

    const query = `
      INSERT INTO daily_tasks (user_id, date, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userId, taskDate, content];
    const { rows } = await pool.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating daily task:', error);
    return res.status(500).json({ error: 'Failed to create daily task.' });
  }
};

// UPDATE a daily task
export const updateDailyTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { date, content, is_completed } = req.body;

    const query = `
      UPDATE daily_tasks
      SET
        date = $1,
        content = $2,
        is_completed = $3,
        updated_at = NOW()
      WHERE id = $4
        AND user_id = $5
      RETURNING *;
    `;
    const values = [date, content, is_completed, id, userId];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or not yours.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error updating daily task:', error);
    return res.status(500).json({ error: 'Failed to update daily task.' });
  }
};

// DELETE a daily task
export const deleteDailyTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const query = `
      DELETE FROM daily_tasks
      WHERE id = $1
        AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or not yours.' });
    }
    return res.json({ message: 'Daily task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting daily task:', error);
    return res.status(500).json({ error: 'Failed to delete daily task.' });
  }
};

// AI-based generation of tasks
export const generateDailyTasksAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Use your same AI config
    const openai = new OpenAI({
      apiKey: process.env.API_KEY, // from your .env
      baseURL: 'https://api.aimlapi.com/v1',
    });

    // Make a chat completion request
    const completion = await openai.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        {
            role: 'system',
            content: `You are an AI that helps generate single-line daily tasks. 
            Do not return them as bullet points or enumerated lines - just simple sentences with spaces as I will be using your answer to automitcally add to a list for selection. 
            No headings or paragraphs. Keep each line simple (one sentence) and try to provide atleast 4-5 of different daily tasks that could be done.
            Lastly, please make the tasks much more detailed and specific.`
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      timeout: 10000,
    });

    const tasksText = completion.choices[0].message.content;

    // Return it as { tasksText: '...' }
    return res.json({ tasksText });
  } catch (error) {
    console.error('Error generating tasks with AI:', error);
    return res.status(500).json({ error: 'Failed to generate tasks.' });
  }
};
