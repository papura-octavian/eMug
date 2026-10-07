import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get("/products")
            .then((res) => setProducts(res.data))
            .catch(() => setError("Nu am putut incarca produsele."));
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Stergi produsul "${name}"?`)) return;

        try {
            await api.delete(`/products/${id}`);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setError("Stergerea a esuat.");
        }
    };

    return (
        <div>
            <h1>Administrare produse</h1>
            {error && <p>{error}</p>}
            <Link to="/admin/products/new">Adauga produs</Link>

            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nume</th>
                        <th>Categorie</th>
                        <th>Pret</th>
                        <th>Stoc</th>
                        <th>Actiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.category?.name}</td>
                            <td>{p.price.toFixed(2)} lei</td>
                            <td>{p.stock}</td>
                            <td>
                                <Link to={`/admin/products/${p.id}/edit`}>Editeaza</Link>
                                <button onClick={() => handleDelete(p.id, p.name)}>Sterge</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminProductsPage;