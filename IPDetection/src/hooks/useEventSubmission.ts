import { useEffect } from "react";
import type { EventDTO } from "../types/event.types";
import { sendEventLogs } from "../services/ip.services";
import { addEventToQueue } from "../services/storage.service";
import { useNetworkStatus } from "./useNetworkStatus";

export function useEventSubmission(
    attemptId: string | null,
    isRunning: boolean,
    eventBatch: React.MutableRefObject<EventDTO[]>
) {
    const { isOnline } = useNetworkStatus();

    useEffect(() => {
        if (!attemptId || !isRunning) {
            return;
        }

        const interval = setInterval(async () => {
            if (eventBatch.current.length === 0) {
                return;
            }

            const eventsToSend = [...eventBatch.current];
            eventBatch.current = [];

            if (isOnline) {
                // Online: send directly
                try {
                    await sendEventLogs(eventsToSend);
                    console.log('Events sent successfully');
                } catch (error) {
                    console.error('Failed to send events, adding to queue:', error);
                    eventsToSend.forEach(event => addEventToQueue(event));
                }
            } else {
                // Offline: add to queue
                console.log('Offline: queuing events');
                eventsToSend.forEach(event => addEventToQueue(event));
            }
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [attemptId, isRunning, isOnline]);
}
