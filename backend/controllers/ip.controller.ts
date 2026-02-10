import type { Request, Response } from "express";
import request from "request-ip"
import { addAttempt, addEvents } from "../services/ip.service.js";

const getIpInfo = (req: Request, res: Response) => {
    res.send("Hello World!");
};

const registerIp = async (req: Request, res: Response) => {
    try {
        //for testing purpose
        const testIp = req.query.ip as string;
        const detectedIp = request.getClientIp(req);

        const ip = testIp || detectedIp;

        let attempt;
        if (ip) {
            attempt = await addAttempt(ip);
        }

        res.status(200).json({
            attempt,
            ipUsed: ip,
            source: testIp ? 'query_parameter' : 'detected'
        });

    } catch (ex: any) {
        console.log(ex.message)
        res.status(500).json({ error: ex.message });
    }
};

const addEventLog = async (req: Request, res: Response) => {
    try {
        const events = req.body;
        const detectedIp = request.getClientIp(req);
        await addEvents(events, detectedIp);
        res.status(200).json({ message: "Events added successfully" });
    } catch (ex: any) {
        console.log(ex.message)
        res.status(500).json({ error: ex.message });
    }
}

export { getIpInfo, registerIp, addEventLog };