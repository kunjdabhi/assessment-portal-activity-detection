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

export type Event = {
    id: string;
    name: EventType;
    timestamp: number;
    attemptId: string;
    metadata: {
        ipAddress: string;
        baselineISP: string;
        baselineRegion: string;
    }

}

export type EventDTO = {
    name: EventType;
    timestamp: number;
    attemptId: string;
    metadata?: {
        browserName: string;
        hostOs: string;
    }
}
