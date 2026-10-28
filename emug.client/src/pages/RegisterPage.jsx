import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);

    const mismatch = confirmPassword !== "" && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Parolele nu coincid.");
            return;
        }
        try {
            await register(email, password, confirmPassword, fullName);
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
                autoComplete="new-password"
                required
            />
            <input
                type="password"
                placeholder="Confirmă parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                aria-invalid={mismatch}
                aria-describedby={mismatch ? "password-mismatch" : undefined}
                required
            />
            {mismatch && (
                <p id="password-mismatch" className="error">Parolele nu coincid.</p>
            )}
            <button type="submit" disabled={mismatch}>Înregistrează-te</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}

export default RegisterPage;
