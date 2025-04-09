import { pool } from './db.js'; 
import dayjs from 'dayjs';

export const getUserAnalyticsDetailed = async (req, res) => {
  try {
    const userId = req.userId;

    // (A) Basic counts
    const [
      conversationsRes,
      messagesRes,
      journalsRes,
      moodsRes,
      remindersRes,
      remindersDoneRes,
      tasksRes,
      tasksDoneRes,
      sleepEntriesRes,
      totalSleepHoursRes,
    ] = await Promise.all([
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM conversations WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS cnt 
         FROM messages 
         WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = $1)`,
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM journal_entries WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM moods WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM reminders WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM reminders WHERE user_id = $1 AND is_completed = true',
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM daily_tasks WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM daily_tasks WHERE user_id = $1 AND is_completed = true',
        [userId]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS cnt FROM sleep_entries WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT COALESCE(SUM(duration_hours), 0) AS total_hrs FROM sleep_entries WHERE user_id = $1',
        [userId]
      ),
    ]);

    const basicCounts = {
      totalConversations: parseInt(conversationsRes.rows[0].cnt, 10),
      totalMessages: parseInt(messagesRes.rows[0].cnt, 10),
      totalJournalEntries: parseInt(journalsRes.rows[0].cnt, 10),
      totalMoods: parseInt(moodsRes.rows[0].cnt, 10),
      totalReminders: parseInt(remindersRes.rows[0].cnt, 10),
      completedReminders: parseInt(remindersDoneRes.rows[0].cnt, 10),
      totalDailyTasks: parseInt(tasksRes.rows[0].cnt, 10),
      completedDailyTasks: parseInt(tasksDoneRes.rows[0].cnt, 10),
      totalSleepEntries: parseInt(sleepEntriesRes.rows[0].cnt, 10),
      totalSleepHours: parseFloat(totalSleepHoursRes.rows[0].total_hrs),
    };

    // (B) Mood distribution: how many times each mood was logged
    const moodDistributionRes = await pool.query(
      `SELECT mood, COUNT(*)::int AS count
       FROM moods
       WHERE user_id = $1
       GROUP BY mood
       ORDER BY count DESC;`,
      [userId]
    );
    const moodDistribution = moodDistributionRes.rows.map((r) => ({
      mood: r.mood,
      count: parseInt(r.count, 10),
    }));

    // (C) Task completion trends (last 7 days): how many tasks exist vs. completed per day
    // We’ll build a table of date + counts
    const taskTrendsRes = await pool.query(
      `SELECT date::date as task_date,
              COUNT(*)::int AS total,
              SUM(CASE WHEN is_completed THEN 1 ELSE 0 END)::int AS done
       FROM daily_tasks
       WHERE user_id = $1
         AND date >= current_date - interval '6 days'
         AND date <= current_date
       GROUP BY date
       ORDER BY date;`,
      [userId]
    );
    // We'll produce an array of { date: 'YYYY-MM-DD', total, done }
    // For each day in the last 7 days, we might fill missing days with 0
    const trendsMap = new Map();
    // Fill a map with real data
    taskTrendsRes.rows.forEach((row) => {
      trendsMap.set(row.task_date.toISOString().slice(0, 10), {
        date: row.task_date.toISOString().slice(0, 10),
        total: parseInt(row.total, 10),
        done: parseInt(row.done, 10),
      });
    });
    // For the last 7 days
    const taskCompletionTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      if (trendsMap.has(d)) {
        taskCompletionTrends.push(trendsMap.get(d));
      } else {
        taskCompletionTrends.push({
          date: d,
          total: 0,
          done: 0,
        });
      }
    }

    // (D) Sleep trends (last 7 days): sum of hours per day, plus average quality if you want
    const sleepTrendsRes = await pool.query(
      `SELECT date(start_time) as sdate,
              COALESCE(SUM(duration_hours),0) as total_hours,
              AVG(sleep_quality) as avg_quality
       FROM sleep_entries
       WHERE user_id = $1
         AND start_time >= (current_date - interval '6 days')
       GROUP BY date(start_time)
       ORDER BY date(start_time);`,
      [userId]
    );
    // We'll do the same approach: fill a map for the last 7 days
    const sleepMap = new Map();
    sleepTrendsRes.rows.forEach((row) => {
      const dd = row.sdate.toISOString().slice(0, 10);
      sleepMap.set(dd, {
        date: dd,
        total_hours: parseFloat(row.total_hours),
        avg_quality: row.avg_quality ? parseFloat(row.avg_quality) : null,
      });
    });
    const sleepTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      if (sleepMap.has(d)) {
        sleepTrends.push(sleepMap.get(d));
      } else {
        sleepTrends.push({
          date: d,
          total_hours: 0,
          avg_quality: null,
        });
      }
    }

    // (E) Possibly we find "most common mood"
    // We can pick the top row in moodDistribution if not empty
    let mostCommonMood = null;
    if (moodDistribution.length > 0) {
      mostCommonMood = moodDistribution[0].mood; // top is the highest count
    }

    // Return all data
    return res.json({
      basicCounts,
      moodDistribution,
      taskCompletionTrends,
      sleepTrends,
      mostCommonMood,
    });
  } catch (error) {
    console.error('Error fetching user analytics (detailed):', error);
    return res.status(500).json({ error: 'Failed to fetch advanced analytics.' });
  }
};
