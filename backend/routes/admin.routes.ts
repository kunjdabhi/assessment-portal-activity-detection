import express from 'express';
import { getAllAttempts, getAttemptEvents } from '../controllers/admin.controller';

const router = express.Router();

// Get all attempts with stats
router.get('/attempts', getAllAttempts);

// Get events for specific attempt
router.get('/attempts/:attemptId/events', getAttemptEvents);

export default router;
