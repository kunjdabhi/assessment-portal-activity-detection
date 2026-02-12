import type { Request, Response } from 'express';
import Attempt from '../models/attempt.model.js';
import Event from '../models/event.model.js';

export const getAllAttempts = async (req: Request, res: Response) => {
    try {
        const attempts = await Attempt.aggregate([
            {
                $sort: { timestamp: -1 }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "attemptId",
                    as: "events"
                }
            },
            {
                $addFields: {
                    eventCount: { $size: "$events" },
                    suspiciousEventCount: {
                        $size: {
                            $filter: {
                                input: "$events",
                                as: "event",
                                cond: {
                                    $in: ["$$event.name", [
                                        'IP_CHANGE_DETECTED',
                                        'FULLSCREEN_EXITED',
                                        'TAB_VISIBILITY_CHANGED',
                                        'WINDOW_BLUR'
                                    ]]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    events: 0
                }
            }
        ]);

        res.status(200).json({ attempts });
    } catch (error) {
        console.error('Error fetching attempts:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};

export const getAttemptEvents = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;

        const attempt = await Attempt.findById(attemptId).lean();

        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

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
