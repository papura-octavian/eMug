import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

api.interceptors.request.use((config) => {
    const saved = localStorage.getItem("user");
    if (saved) {
        const { token } = JSON.parse(saved);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;