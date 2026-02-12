import type { ObjectId } from "mongodb";

export type EventType =
    | "IP_CAPTURED_INITIALLY"
    | "IP_CHECK_PERFORMED"
    | "IP_CHANGE_DETECTED"
    | "IP_CHANGE_CLASSIFIED"
    | "IP_CHANGE_WARNING_SHOWN"
    | "FULLSCREEN_ENTERED"
    | "FULLSCREEN_EXITED"
    | "TAB_VISIBILITY_CHANGED"
    | "WINDOW_BLUR"
    | "WINDOW_FOCUS"
    | "TIMER_TICK"
    | "TIMER_COMPLETED"
    | "COPY_DETECTED"
    | "PASTE_DETECTED";

// Metadata for IP change events
export interface IpChangeMetadata {
    oldIp: string;
    newIp: string;
    ipChangeType?: 'BENIGN' | 'SUSPICIOUS';
    ipChangeCount?: number;
}

// Event document interface
export interface IEvent {
    _id?: ObjectId;
    name: EventType;
    timestamp: Date;
    attemptId: ObjectId;
    metadata?: IpChangeMetadata;
}

// DTO for creating events
export interface CreateEventDTO {
    name: EventType;
    timestamp: Date;
    attemptId: ObjectId;
    metadata?: IpChangeMetadata;
}

// Legacy types (keeping for backwards compatibility)
export type EventLogDTO = {
    name: string;
    timestamp: Date;
    attemptId: string;
    metadata: {
        oldIp: string;
        baselineISP: string;
        baselineRegion: string;
        newIp: string;
        ipChangeType: string;
    }
}

export type RequestDTO = {
    name: string;
    timestamp: Date;
    attemptId: string;
}