import express from 'express';
import {
  getSleepGoal,
  upsertSleepGoal
} from '../sleepGoalsController.js'; // relative path to your root-level controller

const router = express.Router();

// GET the user's current goal
router.get('/', getSleepGoal);

// POST or PUT to create/update the user's sleep goal
router.post('/', upsertSleepGoal);

export default router;
