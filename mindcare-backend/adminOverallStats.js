// FILE: controllers/adminOverallStats.js
import { pool } from './db.js';

export const getOverallStats = async (req, res) => {
  try {
    // Total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count, 10);

    // Users by country (ignoring NULLs)
    const usersByCountryResult = await pool.query(
      `SELECT country, COUNT(*) AS count 
       FROM users 
       WHERE country IS NOT NULL 
       GROUP BY country`
    );
    const usersByCountry = usersByCountryResult.rows;

    // New users per day for the last 30 days
    const growthResult = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS new_users
       FROM users
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    const growthData = growthResult.rows;

    // Total conversations
    const convResult = await pool.query('SELECT COUNT(*) FROM conversations');
    const totalConversations = parseInt(convResult.rows[0].count, 10);

    // Total messages
    const msgResult = await pool.query('SELECT COUNT(*) FROM messages');
    const totalMessages = parseInt(msgResult.rows[0].count, 10);

    // Total journal entries
    const journalResult = await pool.query('SELECT COUNT(*) FROM journal_entries');
    const totalJournalEntries = parseInt(journalResult.rows[0].count, 10);

    // Average mood rating (mapping moods to numbers)
    const moodResult = await pool.query(`
      SELECT AVG(
        CASE mood
          WHEN '😊' THEN 5
          WHEN '😃' THEN 4
          WHEN '😐' THEN 3
          WHEN '😞' THEN 2
          WHEN '😡' THEN 1
          ELSE 3
        END
      ) AS average_mood
      FROM moods
    `);
    const averageMood = moodResult.rows[0].average_mood;

    // Total sleep entries and total sleep hours
    const sleepCountResult = await pool.query('SELECT COUNT(*) FROM sleep_entries');
    const totalSleepEntries = parseInt(sleepCountResult.rows[0].count, 10);

    const sleepHoursResult = await pool.query(
      'SELECT COALESCE(SUM(duration_hours), 0) AS total_hours FROM sleep_entries'
    );
    const totalSleepHours = parseFloat(sleepHoursResult.rows[0].total_hours);

    // Total daily tasks
    const dailyTasksResult = await pool.query('SELECT COUNT(*) FROM daily_tasks');
    const totalDailyTasks = parseInt(dailyTasksResult.rows[0].count, 10);

    res.json({
      totalUsers,
      usersByCountry,
      growthData,
      totalConversations,
      totalMessages,
      totalJournalEntries,
      averageMood,
      totalSleepEntries,
      totalSleepHours,
      totalDailyTasks,
    });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    res.status(500).json({ error: 'Failed to fetch overall statistics.' });
  }
};
