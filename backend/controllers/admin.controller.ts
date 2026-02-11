import type { Request, Response } from 'express';
import Attempt from '../models/attempt.model';
import Event from '../models/event.model';

export const getAllAttempts = async (req: Request, res: Response) => {
    try {
        // Fetch all attempts with event counts
        const attempts = await Attempt.find().sort({ timestamp: -1 }).lean();

        // Get event counts for each attempt
        const attemptsWithStats = await Promise.all(
            attempts.map(async (attempt) => {
                const eventCount = await Event.countDocuments({ attemptId: attempt._id });

                // Count suspicious events (IP changes, fullscreen exits, etc.)
                const suspiciousEventCount = await Event.countDocuments({
                    attemptId: attempt._id,
                    name: {
                        $in: [
                            'IP_CHANGE_DETECTED',
                            'FULLSCREEN_EXITED',
                            'TAB_VISIBILITY_CHANGED',
                            'WINDOW_BLUR'
                        ]
                    }
                });

                return {
                    ...attempt,
                    eventCount,
                    suspiciousEventCount
                };
            })
        );

        res.status(200).json({ attempts: attemptsWithStats });
    } catch (error) {
        console.error('Error fetching attempts:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};

export const getAttemptEvents = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;

        // Fetch attempt details
        const attempt = await Attempt.findById(attemptId).lean();

        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        // Fetch all events for this attempt, sorted by timestamp
        const events = await Event.find({ attemptId })
            .sort({ timestamp: 1 })
            .lean();

        res.status(200).json({
            attempt,
            events
        });
    } catch (error) {
        console.error('Error fetching attempt events:', error);
        res.status(500).json({ error: 'Failed to fetch attempt events' });
    }
};
