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

// token expirat sau invalid: delogam utilizatorul si il trimitem la login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && err.config?.headers?.Authorization) {
            localStorage.removeItem("user");
            window.location.href = "/login?expired=1";
        }
        return Promise.reject(err);
    }
);

export default api;
