import { useEffect, useRef } from 'react';
import {
    saveSession,
    getSession,
    clearSession as clearSessionStorage,
    type SessionData
} from '../services/storage.service';

interface UseSessionPersistenceProps {
    attemptId: string | null;
    timeRemaining: number;
    isRunning: boolean;
    questions?: any[];
    currentIndex?: number;
    onRestore?: (session: SessionData) => void;
}

export function useSessionPersistence({
    attemptId,
    timeRemaining,
    isRunning,
    questions,
    currentIndex,
    onRestore
}: UseSessionPersistenceProps) {
    const hasRestoredRef = useRef(false);
    const saveIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const restoreSession = () => {
            if (hasRestoredRef.current) return;

            try {
                const session = getSession();

                if (session && session.attemptId && onRestore) {
                    onRestore(session);
                    hasRestoredRef.current = true;
                }
            } catch (error) {
                console.error('Failed to restore session:', error);
            }
        };

        restoreSession();
    }, [onRestore]);

    useEffect(() => {
        if (!attemptId || !isRunning) {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
            }
            return;
        }

        const saveSessionData = () => {
            try {
                const session: SessionData = {
                    attemptId,
                    timeRemaining,
                    isRunning,
                    questions,
                    currentIndex,
                    lastUpdated: Date.now()
                };

                saveSession(session);
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        };

        saveSessionData();

        saveIntervalRef.current = setInterval(saveSessionData, 5000);

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
            }
        };
    }, [attemptId, timeRemaining, isRunning, questions, currentIndex]);

    const clearSession = () => {
        try {
            clearSessionStorage();
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    };

    return { clearSession };
}
