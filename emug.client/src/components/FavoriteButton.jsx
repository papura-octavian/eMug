import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

function FavoriteButton({ productId, withLabel = false }) {
    const { user } = useAuth();
    const { isFavorite, toggle } = useWishlist();
    const navigate = useNavigate();
    const active = isFavorite(productId);

    const handleClick = async (e) => {
        // butonul sta si in cardul de produs, care e un link
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            await toggle(productId);
        } catch (err) {
            // la 401 interceptorul din axios redirectioneaza deja spre login
            if (err.response?.status === 401) return;
            const data = err.response?.data;
            window.alert(typeof data === "string" ? data : "Nu am putut actualiza lista de favorite.");
        }
    };

    const label = active ? "Scoate din favorite" : "Adauga la favorite";

    return (
        <button
            type="button"
            className={active ? "fav-btn active" : "fav-btn"}
            onClick={handleClick}
            aria-pressed={active}
            aria-label={label}
            title={label}
        >
            <span aria-hidden="true">{active ? "♥" : "♡"}</span>
            {withLabel && <span>{active ? "In favorite" : "Favorite"}</span>}
        </button>
    );
}

export default FavoriteButton;
