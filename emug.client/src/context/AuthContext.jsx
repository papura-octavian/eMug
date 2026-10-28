import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

// citeste data de expirare (exp, in secunde) din payload-ul JWT
const isExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        if (!saved) return null;
        const data = JSON.parse(saved);
        if (isExpired(data.token)) {
            localStorage.removeItem("user");
            return null;
        }
        return data;
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

    const register = (email, password, confirmPassword, fullName) =>
        api.post("/auth/register", { email, password, confirmPassword, fullName });

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