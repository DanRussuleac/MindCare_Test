import express from 'express';
import { getUserAnalyticsDetailed } from '../analyticsController.js'; // adapt path
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.get('/detailed', verifyToken, getUserAnalyticsDetailed);


export default router;
