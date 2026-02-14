import axios from "axios";
import type { EventDTO } from "../types/event.types";
import { getBrowserName, getOSName } from "../utils/ipUtils";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URI;

const registerIp = async (username: string) => {
    const response = await axios.post(`/api/ip`, {
        username,
        browserName: getBrowserName(),
        hostOs: getOSName()
    });
    return response.data;
}

const sendEventLogs = async (events: EventDTO[]) => {
    const response = await axios.post(`/api/events`, events);
    return response.data;
}

const checkIp = async (attemptId: string) => {
    const response = await axios.post(`/api/check-ip`, { attemptId });
    return response.data;
}

const completeAttempt = async (attemptId: string) => {
    const response = await axios.post(`/api/complete-attempt`, { attemptId });
    return response.data;
}

export { registerIp, sendEventLogs, checkIp, completeAttempt }