import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
    const { user, isAdmin, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="site-header">
            <nav className="nav">
                <Link to="/" className="logo">eMug</Link>

                <div className="nav-links">
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/products">Produse</NavLink>
                    {user && <NavLink to="/wishlist">Favorite</NavLink>}
                    {user && <NavLink to="/orders">Comenzile mele</NavLink>}
                    {isAdmin && <NavLink to="/admin/products">Admin</NavLink>}
                </div>

                <div className="nav-user">
                    <NavLink to="/cart" className="cart-link">
                        Cos {count > 0 && <span className="badge">{count}</span>}
                    </NavLink>
                    {user ? (
                        <>
                            <span>{user.email}</span>
                            {isAdmin && <span className="badge">admin</span>}
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;