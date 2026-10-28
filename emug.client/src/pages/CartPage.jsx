import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
    const { items, subtotal, updateQuantity, removeItem } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div>
                <h1>Cosul de cumparaturi</h1>
                <p>
                    Cosul este gol. <Link to="/products">Vezi produsele</Link>
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Cosul de cumparaturi</h1>

            <ul className="line-list">
                {items.map((item) => (
                    <li key={item.productId} className="line-item">
                        <div className="line-img">
                            {item.imageUrl && <img src={item.imageUrl} alt="" />}
                        </div>
                        <div className="line-info">
                            <Link to={`/products/${item.productId}`}>{item.name}</Link>
                            <span className="product-category">{item.price.toFixed(2)} lei / buc</span>
                        </div>
                        <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                            aria-label={`Cantitate ${item.name}`}
                            className="qty"
                        />
                        <span className="price">{(item.price * item.quantity).toFixed(2)} lei</span>
                        <div className="line-actions">
                            <button className="danger" onClick={() => removeItem(item.productId)}>
                                Sterge
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="summary">
                <p>
                    Subtotal: <strong>{subtotal.toFixed(2)} lei</strong>
                </p>
                <p className="product-category">Livrarea se alege la pasul urmator.</p>
                <button type="submit" onClick={() => navigate("/checkout")}>
                    Continua spre comanda
                </button>
            </div>
        </div>
    );
}

export default CartPage;
