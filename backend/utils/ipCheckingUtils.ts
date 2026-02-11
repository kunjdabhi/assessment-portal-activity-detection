import axios from "axios";
import type { IAttempt } from "../types/Attempt.types.js";

export const getIpInfo = async (ip: string) => {
    try {
        const ipInfoToken = process.env.IPINFO_TOKEN;
        const response = await axios.get(`https://ipinfo.io/${ip}?token=${ipInfoToken}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to get IP info for ${ip}:`, error);
        return { org: 'Unknown', city: 'Unknown' };
    }
}

export const classifyIpChange = async (oldIp: string, newIp: string): Promise<'BENIGN' | 'SUSPICIOUS'> => {
    try {
        const oldIpInfo = await getIpInfo(oldIp);
        const newIpInfo = await getIpInfo(newIp);

        if (oldIpInfo.org === newIpInfo.org && oldIpInfo.city === newIpInfo.city) {
            return "BENIGN";
        }
        return "SUSPICIOUS";
    } catch (error) {
        console.error('Error classifying IP change:', error);
        return "SUSPICIOUS";
    }
}
