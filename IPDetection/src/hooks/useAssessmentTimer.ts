import { useEffect, useRef, useState } from "react";
import type { EventDTO } from "../types/event.types";

export function useAssessmentTimer(
    initialTime: number,
    attemptId: string | null,
    isRunning: boolean,
    setIsRunning: (isRunning: boolean) => void,
    eventBatch: React.MutableRefObject<EventDTO[]>
) {
    const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning && attemptId) {
            eventBatch.current.push({
                name: "TIMER_TICK",
                timestamp: Date.now(),
                attemptId: attemptId
            });

            intervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;

                            eventBatch.current.push({
                                name: "TIMER_COMPLETED",
                                timestamp: Date.now(),
                                attemptId: attemptId
                            });
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, attemptId]);

    return { timeRemaining, setTimeRemaining };
}
