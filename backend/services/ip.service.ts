import Attempt from "../models/attempt.model.js";
import axios from "axios";
import { checkIpChange, classifyIpChange } from "../utils/ipCheckingUtils.js";

const addAttempt = async (ip: string) => {
    const ipInfoToken = process.env.IPINFO_TOKEN;
    const response = await axios.get(`https://ipinfo.io/${ip}?token=${ipInfoToken}`);
    const data = response.data;
    const attempt = new Attempt({
        ipAddress: ip,
        timestamp: new Date(),
        baselineISP: data.org,
        baselineRegion: data.city,

    });
    await Attempt.create(attempt);
    return attempt;

}


const addEvents = async (events: any, detectedIp: string | null) => {
    const attemptData = await Attempt.findOne({
        where: {
            _id: events[0].attemptId
        }
    })
    if (!attemptData) {
        throw new Error("Attempt not found");
    }
    if (detectedIp) {
        const ipChanged = await checkIpChange(attemptData, detectedIp);
        if (ipChanged) {
            const oldIp = attemptData.lastKnownIp || attemptData.ipAddress;
            attemptData.ipChangeCount++;
            attemptData.lastKnownIp = detectedIp;
            await attemptData.save();
            events.unshift({
                name: "IP_CHANGE_DETECTED",
                timestamp: Date.now(),
                attemptId: attemptData._id,
                metadata: {
                    oldIp: oldIp,
                    newIp: detectedIp
                }
            })
        }

        const ipChangeType = await classifyIpChange(attemptData.lastKnownIp || attemptData.ipAddress, detectedIp);
        events.unshift({
            name: "IP_CHANGE_CLASSIFIED",
            timestamp: Date.now(),
            attemptId: attemptData._id,
            metadata: {
                oldIp: attemptData.lastKnownIp || attemptData.ipAddress,
                newIp: detectedIp,
                ipChangeType: ipChangeType
            }
        })

        if (ipChanged) {
            events.unshift({
                name: "IP_CHANGE_WARNING_SHOWN",
                timestamp: Date.now(),
                attemptId: attemptData._id,
                metadata: {
                    oldIp: attemptData.lastKnownIp || attemptData.ipAddress,
                    newIp: detectedIp,
                    ipChangeType: ipChangeType
                }
            })
        }


    }

}

export { addAttempt, addEvents }