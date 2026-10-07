import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const emptyForm = {
    name: "",
    description: "",
    specifications: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: "",
    supplierId: "",
    deliveryMethodIds: [],
};

function ProductFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [deliveryMethods, setDeliveryMethods] = useState([]);
    const [error, setError] = useState(null);

    // 1. incarca listele pentru dropdown-uri si checkbox-uri
    useEffect(() => {
        Promise.all([
            api.get("/categories"),
            api.get("/suppliers"),
            api.get("/delivery-methods"),
        ])
            .then(([cats, sups, dels]) => {
                setCategories(cats.data);
                setSuppliers(sups.data);
                setDeliveryMethods(dels.data);
            })
            .catch(() => setError("Nu am putut incarca listele."));
    }, []);

    // 2. daca editam, incarca produsul si completeaza formularul
    useEffect(() => {
        if (!isEdit) return;
        api
            .get(`/products/${id}`)
            .then((res) => {
                const p = res.data;
                setForm({
                    name: p.name,
                    description: p.description,
                    specifications: p.specifications,
                    price: p.price,
                    stock: p.stock,
                    imageUrl: p.imageUrl ?? "",
                    categoryId: p.categoryId,
                    supplierId: p.supplierId,
                    deliveryMethodIds: p.deliveryMethods.map((d) => d.id),
                });
            })
            .catch(() => setError("Nu am putut incarca produsul."));
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleDelivery = (deliveryId) => {
        setForm((prev) => ({
            ...prev,
            deliveryMethodIds: prev.deliveryMethodIds.includes(deliveryId)
                ? prev.deliveryMethodIds.filter((x) => x !== deliveryId)
                : [...prev.deliveryMethodIds, deliveryId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const payload = {
            name: form.name,
            description: form.description,
            specifications: form.specifications,
            price: Number(form.price),
            stock: Number(form.stock),
            imageUrl: form.imageUrl || null,
            categoryId: Number(form.categoryId),
            supplierId: Number(form.supplierId),
            deliveryMethodIds: form.deliveryMethodIds,
        };

        try {
            if (isEdit) {
                await api.put(`/products/${id}`, payload);
            } else {
                await api.post("/products", payload);
            }
            navigate("/admin/products");
        } catch (err) {
            const data = err.response?.data;
            setError(typeof data === "string" ? data : "Salvarea a esuat.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>{isEdit ? "Editeaza produs" : "Adauga produs"}</h1>

            <div>
                <label>Nume</label>
                <input name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div>
                <label>Descriere</label>
                <textarea name="description" value={form.description} onChange={handleChange} required />
            </div>

            <div>
                <label>Specificatii</label>
                <textarea name="specifications" value={form.specifications} onChange={handleChange} required />
            </div>

            <div>
                <label>Pret (lei)</label>
                <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange} required />
            </div>

            <div>
                <label>Stoc</label>
                <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
            </div>

            <div>
                <label>Imagine (URL, optional)</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
            </div>

            <div>
                <label>Categorie</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                    <option value="">Alege categoria</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Furnizor</label>
                <select name="supplierId" value={form.supplierId} onChange={handleChange} required>
                    <option value="">Alege furnizorul</option>
                    {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Modalitati de livrare</label>
                {deliveryMethods.map((d) => (
                    <div key={d.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={form.deliveryMethodIds.includes(d.id)}
                                onChange={() => toggleDelivery(d.id)}
                            />
                            {d.name} ({d.price.toFixed(2)} lei, {d.estimatedDays} zile)
                        </label>
                    </div>
                ))}
            </div>

            <button type="submit">Salveaza</button>
            <button type="button" onClick={() => navigate("/admin/products")}>Anuleaza</button>
            {error && <p>{error}</p>}
        </form>
    );
}

export default ProductFormPage;