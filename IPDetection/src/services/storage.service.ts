import type { EventDTO } from '../types/event.types';

const EVENT_QUEUE_KEY = 'assessment-event-queue';
const SESSION_KEY = 'assessment-session';

export interface SessionData {
    attemptId: string;
    timeRemaining: number;
    isRunning: boolean;
    questions?: any[];
    currentIndex?: number;
    lastUpdated: number;
}

export const saveSession = (session: SessionData): void => {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
        console.error('Failed to save session:', error);
    }
};

export const getSession = (): SessionData | null => {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get session:', error);
        return null;
    }
};

export const clearSession = (): void => {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error('Failed to clear session:', error);
    }
};

export const addEventToQueue = (event: EventDTO): void => {
    try {
        const queue = getEventQueue();
        queue.push(event);
        localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('Failed to add event to queue:', error);
    }
};

export const getEventQueue = (): EventDTO[] => {
    try {
        const data = localStorage.getItem(EVENT_QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to get event queue:', error);
        return [];
    }
};

export const clearEventQueue = (): void => {
    try {
        localStorage.removeItem(EVENT_QUEUE_KEY);
    } catch (error) {
        console.error('Failed to clear event queue:', error);
    }
};

export const clearAllData = (): void => {
    clearSession();
    clearEventQueue();
};
