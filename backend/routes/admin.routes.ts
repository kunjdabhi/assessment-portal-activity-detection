import express from 'express';
import { getAllAttempts, getAttemptEvents } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/attempts', getAllAttempts);

router.get('/attempts/:attemptId/events', getAttemptEvents);

export default router;
