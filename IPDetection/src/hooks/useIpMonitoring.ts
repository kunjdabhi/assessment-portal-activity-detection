import { useEffect, useRef } from "react";
import { checkIp } from "../services/ip.services";

interface UseIpMonitoringProps {
    attemptId: string | null;
    isRunning: boolean;
    intervalMs?: number; // Configurable interval in milliseconds
}

export function useIpMonitoring({
    attemptId,
    isRunning,
    intervalMs = 30000 // Default: 30 seconds
}: UseIpMonitoringProps) {
    const ipCheckIntervalRef = useRef<number | null>(null);
    const lastIpChangeWarningRef = useRef<number>(0);
    const WARNING_COOLDOWN = 60000; // 1 minute cooldown between warnings

    useEffect(() => {
        if (!attemptId || !isRunning) {
            return;
        }

        const performIpCheck = async () => {
            try {
                const result = await checkIp(attemptId);

                // Backend now logs IP_CHECK_PERFORMED and all IP change events
                // No need to log here anymore

                // If IP changed, handle it
                if (result.ipChanged) {
                    const now = Date.now();

                    // Only show warning if cooldown period has passed
                    const shouldShowWarning = (now - lastIpChangeWarningRef.current) > WARNING_COOLDOWN;

                    if (shouldShowWarning) {
                        lastIpChangeWarningRef.current = now;

                        // Dispatch custom event for UI to handle
                        window.dispatchEvent(new CustomEvent('ip-change-detected', {
                            detail: {
                                oldIp: result.oldIp,
                                newIp: result.currentIp,
                                ipChangeType: result.ipChangeType
                            }
                        }));
                    }
                }
            } catch (error) {
                console.error("IP check failed:", error);
                // Backend handles error logging as well
            }
        };

        // Perform initial check
        performIpCheck();

        // Set up periodic checking
        ipCheckIntervalRef.current = setInterval(performIpCheck, intervalMs);

        return () => {
            if (ipCheckIntervalRef.current) {
                clearInterval(ipCheckIntervalRef.current);
                ipCheckIntervalRef.current = null;
            }
        };
    }, [attemptId, isRunning, intervalMs]);

    return null;
}
