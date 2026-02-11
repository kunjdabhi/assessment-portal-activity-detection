import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URI;

export const getAllAttempts = async () => {
    const response = await axios.get(`/api/admin/attempts`);
    return response.data;
};

export const getAttemptEvents = async (attemptId: string) => {
    const response = await axios.get(`/api/admin/attempts/${attemptId}/events`);
    return response.data;
};
