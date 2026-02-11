import type { ObjectId } from "mongodb";

// Attempt Document Interface (matches Mongoose schema)
export interface IAttempt {
    _id?: ObjectId;
    ipAddress: string;
    username: string;
    timestamp: Date;
    baselineISP?: string;
    baselineRegion?: string;
    ipChangeCount: number;
    lastKnownIp?: string;
    browserName?: string;
    hostOs?: string;
}

// Request body for creating an attempt
export interface CreateAttemptDTO {
    ip: string;
    username: string;
    browserName: string;
    hostOs: string;
}

// IP Check result
export interface IpCheckResult {
    ipChanged: boolean;
    ipChangeType: 'BENIGN' | 'SUSPICIOUS' | null;
    oldIp?: string;
    newIp?: string;
}
