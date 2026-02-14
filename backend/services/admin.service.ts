import Attempt from '../models/attempt.model.js';
import Event from '../models/event.model.js';

export const fetchAllAttempts = async () => {
    return Attempt.aggregate([
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
};

export const fetchAttemptById = async (attemptId: string) => {
    return Attempt.findById(attemptId).lean();
};

export const fetchEventsByAttemptId = async (attemptId: string) => {
    return Event.find({ attemptId } as any)
        .sort({ timestamp: 1 })
        .lean();
};
