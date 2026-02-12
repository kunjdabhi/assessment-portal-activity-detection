import Attempt from "../models/attempt.model.js";
import Event from "../models/event.model.js";
import { classifyIpChange, getIpInfo } from "../utils/ipCheckingUtils.js";
import type { CreateEventDTO } from "../types/EventsDTO.types.js";
import type { CreateAttemptDTO } from "../types/Attempt.types.js";

const addAttempt = async (body: CreateAttemptDTO) => {
    const data = await getIpInfo(body.ip);
    const attempt = new Attempt({
        ipAddress: body.ip,
        username: body.username,
        timestamp: new Date(),
        baselineISP: data.org,
        baselineRegion: data.city,
        browserName: body.browserName,
        hostOs: body.hostOs,
        lastKnownIp: null,
        ipChangeCount: 0
    });
    await Attempt.create(attempt);
    return attempt;

}


const handleIpChange = async (attemptData: any, detectedIp: string): Promise<{
    ipChanged: boolean;
    ipChangeType: 'BENIGN' | 'SUSPICIOUS' | null;
    oldIp: string;
    events: CreateEventDTO[];
}> => {
    const lastKnownIp = attemptData.lastKnownIp || attemptData.ipAddress;
    const ipChanged = detectedIp !== lastKnownIp;
    const events: CreateEventDTO[] = [];
    let ipChangeType: 'BENIGN' | 'SUSPICIOUS' | null = null;
    const oldIp = lastKnownIp;

    if (ipChanged) {
        attemptData.ipChangeCount++;
        attemptData.lastKnownIp = detectedIp;
        await attemptData.save();

        ipChangeType = await classifyIpChange(oldIp, detectedIp);

        events.push(
            {
                name: "IP_CHANGE_DETECTED",
                timestamp: new Date(),
                attemptId: attemptData._id,
                metadata: { oldIp, newIp: detectedIp, ipChangeCount: attemptData.ipChangeCount }
            },
            {
                name: "IP_CHANGE_CLASSIFIED",
                timestamp: new Date(),
                attemptId: attemptData._id,
                metadata: { oldIp, newIp: detectedIp, ipChangeType, ipChangeCount: attemptData.ipChangeCount }
            },
            {
                name: "IP_CHANGE_WARNING_SHOWN",
                timestamp: new Date(),
                attemptId: attemptData._id,
                metadata: { oldIp, newIp: detectedIp, ipChangeType, ipChangeCount: attemptData.ipChangeCount }
            }
        );
    }

    return { ipChanged, ipChangeType, oldIp, events };
};

const addEvents = async (events: CreateEventDTO[], detectedIp: string | null): Promise<boolean> => {
    const attemptData = await Attempt.findOne({
        _id: events[0]?.attemptId
    });

    if (!attemptData) {
        throw new Error("Attempt not found");
    }

    let ipChanged = false;

    if (detectedIp) {
        const result = await handleIpChange(attemptData, detectedIp);
        ipChanged = result.ipChanged;

        // Add generated IP change events to the beginning
        if (result.events.length > 0) {
            events.unshift(...result.events);
        }
    }

    const eventToAdd = events.map((event: CreateEventDTO) => {
        const baseEvent = {
            name: event.name,
            timestamp: event.timestamp || new Date(),
            attemptId: attemptData._id,
        };

        if (event.metadata && (event.metadata.oldIp || event.metadata.newIp)) {
            return {
                ...baseEvent,
                metadata: event.metadata
            };
        }

        return baseEvent;
    });

    await Event.insertMany(eventToAdd);

    return ipChanged;
}

const checkIpForAttempt = async (attemptId: string, detectedIp: string | null) => {
    const attemptData = await Attempt.findOne({ _id: attemptId });

    if (!attemptData) {
        throw new Error("Attempt not found");
    }

    const eventsToAdd: CreateEventDTO[] = [];

    eventsToAdd.push({
        name: "IP_CHECK_PERFORMED",
        timestamp: new Date(),
        attemptId: attemptData._id!
    });

    let ipChanged = false;
    let ipChangeType = null;
    let oldIp = attemptData.lastKnownIp || attemptData.ipAddress;

    if (detectedIp) {
        const result = await handleIpChange(attemptData, detectedIp);
        ipChanged = result.ipChanged;
        ipChangeType = result.ipChangeType;
        oldIp = result.oldIp;

        if (result.events.length > 0) {
            eventsToAdd.push(...result.events);
        }
    }

    await Event.insertMany(eventsToAdd);

    return {
        ipChanged,
        ipChangeType,
        oldIp,
        newIp: detectedIp
    };
}

const completeAttempt = async (attemptId: string) => {
    try {
        const attempt = await Attempt.findById(attemptId);

        if (!attempt) {
            throw new Error('Attempt not found');
        }

        const completionEvent = {
            name: 'ATTEMPT_COMPLETED',
            timestamp: new Date(),
            attemptId: attemptId
        };

        await Event.create(completionEvent);

        return {
            success: true,
            message: 'Attempt completed successfully',
            attemptId: attemptId
        };
    } catch (error) {
        console.error('Error completing attempt:', error);
        throw error;
    }
};

export { addAttempt, addEvents, checkIpForAttempt, completeAttempt };