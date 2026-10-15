import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

function HomePage() {
    const [products, setProducts] = useState(null);

    useEffect(() => {
        api
            .get("/products")
            .then((res) => setProducts(res.data))
            .catch(() => setProducts([]));
    }, []);

    const latest = products
        ? [...products].sort((a, b) => b.id - a.id).slice(0, 4)
        : [];

    return (
        <div>
            <section className="hero">
                <h1>Componente si periferice pentru PC</h1>
                <p>
                    Procesoare, placi video, SSD-uri si tot ce-ti mai trebuie pe birou.
                    eMug: ai mug, ai tot.
                </p>
                <Link to="/products" className="btn">Vezi produsele</Link>
            </section>

            {latest.length > 0 && (
                <section>
                    <div className="section-head">
                        <h2>Adaugate recent</h2>
                        <Link to="/products">Vezi toate produsele</Link>
                    </div>
                    <div className="product-grid">
                        {latest.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            <section className="perks">
                <div className="perk">
                    <h3>Livrare in 1-2 zile</h3>
                    <p>Curier standard sau express, la alegere pentru fiecare produs.</p>
                </div>
                <div className="perk">
                    <h3>Ridicare personala</h3>
                    <p>Gratuita, pentru produsele care o permit.</p>
                </div>
                <div className="perk">
                    <h3>De la procesor la mouse</h3>
                    <p>Componente pentru calculatorul tau si periferice pentru birou.</p>
                </div>
            </section>
        </div>
    );
}

export default HomePage;