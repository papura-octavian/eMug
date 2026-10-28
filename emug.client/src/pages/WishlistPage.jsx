import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function WishlistPage() {
    const { toggle } = useWishlist();
    const { addItem } = useCart();
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get("/wishlist")
            .then((res) => setItems(res.data))
            .catch(() => setError("Nu am putut incarca lista de favorite."));
    }, []);

    const handleRemove = async (productId) => {
        try {
            await toggle(productId);
            setItems((prev) => prev.filter((i) => i.productId !== productId));
        } catch {
            setError("Stergerea a esuat.");
        }
    };

    const handleAddToCart = (item) => {
        addItem({
            id: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            stock: item.stock,
        });
    };

    if (error) return <p>{error}</p>;
    if (!items) return <p>Se incarca...</p>;

    return (
        <div>
            <h1>Produse favorite</h1>

            {items.length === 0 ? (
                <p>
                    Nu ai niciun produs la favorite. <Link to="/products">Descopera produsele</Link>
                </p>
            ) : (
                <ul className="line-list">
                    {items.map((item) => (
                        <li key={item.productId} className="line-item">
                            <div className="line-img">
                                {item.imageUrl && <img src={item.imageUrl} alt="" />}
                            </div>
                            <div className="line-info">
                                <span className="product-category">{item.category}</span>
                                <Link to={`/products/${item.productId}`}>{item.name}</Link>
                                <span className={item.stock > 0 ? "stock" : "stock out"}>
                                    {item.stock > 0 ? "In stoc" : "Stoc epuizat"}
                                </span>
                            </div>
                            <span className="price">{item.price.toFixed(2)} lei</span>
                            <div className="line-actions">
                                <button type="submit" onClick={() => handleAddToCart(item)} disabled={item.stock === 0}>
                                    Adauga in cos
                                </button>
                                <button className="danger" onClick={() => handleRemove(item.productId)}>
                                    Sterge
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default WishlistPage;
