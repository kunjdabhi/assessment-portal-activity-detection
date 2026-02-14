import type { Request, Response } from 'express';
import { fetchAllAttempts, fetchAttemptById, fetchEventsByAttemptId } from '../services/admin.service.js';

export const getAllAttempts = async (req: Request, res: Response) => {
    try {
        const attempts = await fetchAllAttempts();
        res.status(200).json({ attempts });
    } catch (error) {
        console.error('Error fetching attempts:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};

export const getAttemptEvents = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;
        if (!attemptId) {
            return res.status(400).json({ error: 'Attempt ID is required' });
        }
        const attempt = await fetchAttemptById(attemptId as string);

        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        const events = await fetchEventsByAttemptId(attemptId as string);

        res.status(200).json({
            attempt,
            events
        });
    } catch (error) {
        console.error('Error fetching attempt events:', error);
        res.status(500).json({ error: 'Failed to fetch attempt events' });
    }
};
