import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await register(email, password, fullName);
            navigate("/login");
        } catch (err) {
            const data = err.response?.data;
            setError(Array.isArray(data) ? data.join(" ") : "Înregistrarea a eșuat.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Creează cont</h1>
            <input
                placeholder="Nume complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Parolă"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Înregistrează-te</button>
            {error && <p>{error}</p>}
        </form>
    );
}

export default RegisterPage;