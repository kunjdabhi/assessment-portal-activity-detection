import { useEffect, useRef, type RefObject } from "react";
import type { EventDTO } from "../types/event.types";

export function useBrowserEventHandlers(
    assessmentDurationInSeconds: number,
    attemptId: string | null,
    _setAttemptId: (id: string) => void,
    eventBatch: RefObject<EventDTO[]>
) {
    const timerRef = useRef<number | null>(null);


    useEffect(() => {
        if (!attemptId) {
            return;
        }

        const handleFullscreenChange = () => {
            if (document.fullscreenElement) {
                addEventsToBatch({
                    name: "FULLSCREEN_ENTERED",
                    timestamp: Date.now(),
                    attemptId: attemptId
                }, eventBatch);
            } else {
                addEventsToBatch({
                    name: "FULLSCREEN_EXITED",
                    timestamp: Date.now(),
                    attemptId: attemptId
                }, eventBatch);
            }
        };


        const handleVisibilityChange = () => {
            addEventsToBatch({
                name: "TAB_VISIBILITY_CHANGED",
                timestamp: Date.now(),
                attemptId: attemptId
            }, eventBatch);
        };


        const handleWindowBlur = () => {
            addEventsToBatch({
                name: "WINDOW_BLUR",
                timestamp: Date.now(),
                attemptId: attemptId
            }, eventBatch);
        };

        const handleWindowFocus = () => {
            addEventsToBatch({
                name: "WINDOW_FOCUS",
                timestamp: Date.now(),
                attemptId: attemptId
            }, eventBatch);
        };

        const handleCopy = () => {
            addEventsToBatch({
                name: "COPY_DETECTED",
                timestamp: Date.now(),
                attemptId: attemptId
            }, eventBatch);
        };

        const handlePaste = () => {
            addEventsToBatch({
                name: "PASTE_DETECTED",
                timestamp: Date.now(),
                attemptId: attemptId
            }, eventBatch);
        };



        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("paste", handlePaste);


        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("paste", handlePaste);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [assessmentDurationInSeconds, attemptId]);
}

function addEventsToBatch(event: EventDTO, eventBatch: RefObject<EventDTO[]>) {
    eventBatch.current.push(event);
}


