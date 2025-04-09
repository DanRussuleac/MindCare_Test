import express from 'express';
import {
  analyzeSleepData,
  getAnalysisHistory
} from '../sleepAnalysisController.js';

const router = express.Router();

// POST to trigger a new AI analysis on recent sleep data
router.post('/', analyzeSleepData);

// GET all past analyses for the user
router.get('/history', getAnalysisHistory);

export default router;
