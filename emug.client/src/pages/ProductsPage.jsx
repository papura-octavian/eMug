import { useEffect, useState } from "react";
import api from "../api/axios";

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get("/products")
            .then((res) => setProducts(res.data))
            .catch(() => setError("Nu am putut încărca produsele."));
    }, []);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Produse</h1>
            <div className="product-grid">
                {products.map((p) => (
                    <div className="product-card" key={p.id}>
                        <h3>{p.name}</h3>
                        <p>{p.category?.name}</p>
                        <p>{p.price.toFixed(2)} lei</p>
                        <p>{p.stock > 0 ? `În stoc: ${p.stock}` : "Stoc epuizat"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductsPage;