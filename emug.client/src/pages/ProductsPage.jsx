import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. categoriile pentru dropdown, o singura data
    useEffect(() => {
        api
            .get("/categories")
            .then((res) => setCategories(res.data))
            .catch(() => setError("Nu am putut incarca categoriile."));
    }, []);

    // 2. produsele, refacute cand se schimba filtrul sau cautarea
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            api
                .get("/products", {
                    params: {
                        categoryId: categoryId || undefined,
                        search: search || undefined,
                    },
                })
                .then((res) => {
                    setProducts(res.data);
                    setError(null);
                })
                .catch(() => setError("Nu am putut incarca produsele."))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [categoryId, search]);

    return (
        <div>
            <h1>Produse</h1>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Cauta produs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Toate categoriile</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p>{error}</p>}
            {loading && <p>Se incarca...</p>}
            {!loading && !error && products.length === 0 && <p>Niciun produs gasit.</p>}

            <div className="product-grid">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}

export default ProductsPage;