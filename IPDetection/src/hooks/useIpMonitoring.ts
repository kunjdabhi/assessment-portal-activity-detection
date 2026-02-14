import { useEffect, useRef } from "react";
import { checkIp } from "../services/ip.services";

interface UseIpMonitoringProps {
    attemptId: string | null;
    isRunning: boolean;
    intervalMs?: number;
}

export function useIpMonitoring({
    attemptId,
    isRunning,
    intervalMs = 30000,
}: UseIpMonitoringProps) {
    const ipCheckIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!attemptId || !isRunning) {
            return;
        }

        const performIpCheck = async () => {
            try {
                const result = await checkIp(attemptId);

                if (result.ipChanged) {
                    window.dispatchEvent(new CustomEvent('ip-change-detected', {
                        detail: {
                            oldIp: result.oldIp,
                            newIp: result.currentIp,
                            ipChangeType: result.ipChangeType
                        }
                    }));
                }
            } catch (error) {
                alert("Failed to verify IP address. Please check your connection.");
            }
        };

        performIpCheck();

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
