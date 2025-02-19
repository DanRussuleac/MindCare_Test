// routes/dailyTasks.js
import express from 'express';
import {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  generateDailyTasksAI
} from '../dailyTasksController.js';

const router = express.Router();


router.get('/', getDailyTasks);
router.post('/', createDailyTask);
router.put('/:id', updateDailyTask);
router.delete('/:id', deleteDailyTask);

// Optional AI generation route
router.post('/generate', generateDailyTasksAI);

export default router;
