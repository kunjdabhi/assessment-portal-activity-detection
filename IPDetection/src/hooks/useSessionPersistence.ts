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
    onRestore?: (session: SessionData) => void;
}

export function useSessionPersistence({
    attemptId,
    timeRemaining,
    isRunning,
    onRestore
}: UseSessionPersistenceProps) {
    const hasRestoredRef = useRef(false);
    const saveIntervalRef = useRef<number | null>(null);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = () => {
            if (hasRestoredRef.current) return;

            try {
                const session = getSession();

                if (session && session.attemptId && onRestore) {
                    console.log('Restoring session from localStorage:', session);
                    onRestore(session);
                    hasRestoredRef.current = true;
                }
            } catch (error) {
                console.error('Failed to restore session:', error);
            }
        };

        restoreSession();
    }, [onRestore]);

    // Save session periodically
    useEffect(() => {
        if (!attemptId || !isRunning) {
            // Clear interval if not running
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
            }
            return;
        }

        const saveSessionData = () => {
            try {
                const session: SessionData = {
                    attemptId: attemptId,
                    timeRemaining: timeRemaining,
                    isRunning: isRunning,
                    lastUpdated: Date.now()
                };

                saveSession(session);
                console.log('Session saved to localStorage');
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        };

        // Save immediately
        saveSessionData();

        // Then save every 5 seconds
        saveIntervalRef.current = setInterval(saveSessionData, 5000);

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
            }
        };
    }, [attemptId, timeRemaining, isRunning]);

    // Clear session when assessment completes
    const clearSession = () => {
        try {
            clearSessionStorage();
            console.log('Session cleared from localStorage');
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    };

    return { clearSession };
}
