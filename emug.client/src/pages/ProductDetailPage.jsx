import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import FavoriteButton from "../components/FavoriteButton";

function ProductDetailPage() {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const { items, addItem } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const [result, setResult] = useState({ id: null, product: null, error: null });

    useEffect(() => {
        let ignore = false;

        api
            .get(`/products/${id}`)
            .then((res) => {
                if (!ignore) setResult({ id, product: res.data, error: null });
            })
            .catch((err) => {
                if (!ignore) {
                    setResult({
                        id,
                        product: null,
                        error:
                            err.response?.status === 404
                                ? "Produsul nu exista."
                                : "Nu am putut incarca produsul.",
                    });
                }
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    const loading = result.id !== id;
    const { product, error } = result;

    if (loading) return <p>Se incarca...</p>;
    if (error) {
        return (
            <div>
                <p>{error}</p>
                <Link to="/products">Inapoi la produse</Link>
            </div>
        );
    }

    const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
    const canAdd = product.stock - inCart > 0;

    const handleAdd = () => {
        addItem(product, quantity);
        setAdded(true);
    };

    return (
        <div>
            <Link to="/products">&larr; Inapoi la produse</Link>

            <h1>{product.name}</h1>

            {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} width="300" />
            )}

            <p>{product.description}</p>

            <h2>{product.price.toFixed(2)} lei</h2>
            <p>
                {product.stock > 0 ? `In stoc: ${product.stock} bucati` : "Stoc epuizat"}
            </p>

            <div className="buy-box">
                {product.stock > 0 && (
                    <>
                        <label htmlFor="qty">Cantitate</label>
                        <input
                            id="qty"
                            type="number"
                            min="1"
                            max={Math.max(1, product.stock - inCart)}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                            disabled={!canAdd}
                            className="qty"
                        />
                        <button type="submit" onClick={handleAdd} disabled={!canAdd}>
                            Adauga in cos
                        </button>
                    </>
                )}
                <FavoriteButton productId={product.id} withLabel />
            </div>
            {inCart > 0 && !canAdd && <p>Ai deja in cos tot stocul disponibil.</p>}
            {added && (
                <p className="notice">
                    Produsul a fost adaugat in cos.{" "}
                    <button type="button" onClick={() => navigate("/cart")}>Vezi cosul</button>
                </p>
            )}

            <h3>Specificatii</h3>
            <ul>
                {product.specifications.split(",").map((spec, i) => (
                    <li key={i}>{spec.trim()}</li>
                ))}
            </ul>

            <h3>Detalii</h3>
            <p>Categorie: {product.category.name}</p>
            <p>Furnizor: {product.supplier.name}</p>

            <h3>Modalitati de livrare</h3>
            {product.deliveryMethods.length === 0 ? (
                <p>Nicio modalitate de livrare disponibila.</p>
            ) : (
                <ul>
                    {product.deliveryMethods.map((d) => (
                        <li key={d.id}>
                            {d.name}: {d.price === 0 ? "gratuit" : `${d.price.toFixed(2)} lei`},{" "}
                            {d.estimatedDays} {d.estimatedDays === 1 ? "zi" : "zile"}
                        </li>
                    ))}
                </ul>
            )}

            {isAdmin && (
                <Link to={`/admin/products/${product.id}/edit`}>Editeaza produsul</Link>
            )}
        </div>
    );
}

export default ProductDetailPage;