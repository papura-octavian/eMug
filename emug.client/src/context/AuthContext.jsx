import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const data = {
            token: res.data.token,
            email: res.data.email,
            roles: res.data.roles,
        };
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
    };

    const register = (email, password, fullName) =>
        api.post("/auth/register", { email, password, fullName });

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    const isAdmin = user?.roles?.includes("Admin") ?? false;

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);