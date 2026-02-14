import { useEffect, useRef } from "react";
import { checkIp } from "../services/ip.services";

export interface IpChangeDetail {
    oldIp: string;
    newIp: string;
    ipChangeType: 'BENIGN' | 'SUSPICIOUS';
}

interface UseIpMonitoringProps {
    attemptId: string | null;
    isRunning: boolean;
    intervalMs?: number;
    onIpChange: (detail: IpChangeDetail) => void;
    onError: (message: string) => void;
}

export function useIpMonitoring({
    attemptId,
    isRunning,
    intervalMs = 30000,
    onIpChange,
    onError,
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
                    onIpChange({
                        oldIp: result.oldIp,
                        newIp: result.currentIp,
                        ipChangeType: result.ipChangeType
                    });
                }
            } catch (error) {
                console.error("Failed to verify IP address:", error);
                onError('Failed to verify IP address. Please check your connection.');
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

