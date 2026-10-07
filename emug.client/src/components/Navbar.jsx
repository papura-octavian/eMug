import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav>
            <strong>eMug</strong>
            <Link to="/">Home</Link>
            <Link to="/products">Produse</Link>
            {isAdmin && <Link to="/admin/products">Admin</Link>}

            {user ? (
                <>
                    <span>
                        {user.email}
                        {isAdmin && " (admin)"}
                    </span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}

export default Navbar;