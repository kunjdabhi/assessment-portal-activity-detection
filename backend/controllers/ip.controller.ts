import type { Request, Response } from "express";
import request from "request-ip"
import { addAttempt, addEvents, checkIpForAttempt, completeAttempt as completeAttemptService } from "../services/ip.service.js";

const getIpInfo = (req: Request, res: Response) => {
    res.send("Hello World!");
};

const registerIp = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const { username } = body;

        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }

        const ip = request.getClientIp(req);

        let attempt;
        if (ip) {
            attempt = await addAttempt({
                ...body,
                username,
                ip
            });
        }

        res.status(200).json({
            attempt,
            ipUsed: ip,
            source: 'detected'
        });

    } catch (ex) {
        const error = ex as Error;
        res.status(500).json({ error: error.message });
    }
};

const addEventLog = async (req: Request, res: Response) => {
    try {
        const events = req.body;
        const detectedIp = request.getClientIp(req);
        const ipChanged = await addEvents(events, detectedIp);
        res.status(200).json({ message: "Events added successfully", ipChanged });
    } catch (ex) {
        const error = ex as Error;
        res.status(500).json({ error: error.message });
    }
}

const checkIp = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.body;

        const currentIp = request.getClientIp(req);

        if (!attemptId) {
            return res.status(400).json({ error: 'attemptId is required' });
        }

        const result = await checkIpForAttempt(attemptId, currentIp as string);

        res.status(200).json({
            ...result,
            currentIp,
            source: 'detected'
        });

    } catch (ex) {
        const error = ex as Error;
        console.error("Error in checkIp:", error.message);

        if (error.message === 'Attempt not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

const completeAttempt = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.body;

        if (!attemptId) {
            return res.status(400).json({ error: 'attemptId is required' });
        }

        const result = await completeAttemptService(attemptId);

        res.status(200).json(result);

    } catch (ex) {
        const error = ex as Error;
        console.error("Error in completeAttempt:", error.message);

        if (error.message === 'Attempt not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

export { getIpInfo, registerIp, addEventLog, checkIp, completeAttempt };