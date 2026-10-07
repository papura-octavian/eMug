import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ProductDetailPage() {
    const { id } = useParams();
    const { isAdmin } = useAuth();

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