// routes/reminders.js
import express from 'express';
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
} from '../remindersController.js';  // because remindersController is at project root

const router = express.Router();


router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
