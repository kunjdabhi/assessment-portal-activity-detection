import axios from "axios";
import type { EventDTO } from "../../types/event.types";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URI;

const registerIp = async (ip: string) => {
    const response = await axios.post(`/api/ip?ip=${ip}`);
    return response.data;
}

const sendEventLogs = async (events: EventDTO[]) => {
    const response = await axios.post(`/api/events`, events);
    return response.data;
}

export { registerIp, sendEventLogs }