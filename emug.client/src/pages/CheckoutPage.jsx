import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const emptyForm = {
    fullName: "",
    phone: "",
    address: "",
    city: "",
    county: "",
    postalCode: "",
    deliveryMethodId: "",
    paymentMethod: "Ramburs",
    notes: "",
};

function CheckoutPage() {
    const { items, subtotal, clear } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [deliveryMethods, setDeliveryMethods] = useState(null);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    // 1. livrarile disponibile sunt doar cele acceptate de toate produsele din cos
    useEffect(() => {
        if (items.length === 0) return;
        Promise.all(items.map((i) => api.get(`/products/${i.productId}`)))
            .then((responses) => {
                const lists = responses.map((r) => r.data.deliveryMethods);
                const common = lists[0].filter((d) => lists.every((l) => l.some((x) => x.id === d.id)));
                setDeliveryMethods(common);
            })
            .catch(() => setError("Nu am putut incarca modalitatile de livrare."));
        // se incarca o singura data, la intrarea pe pagina
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (items.length === 0) {
        return (
            <div>
                <h1>Finalizare comanda</h1>
                <p>
                    Cosul este gol. <Link to="/products">Vezi produsele</Link>
                </p>
            </div>
        );
    }

    const delivery = deliveryMethods?.find((d) => d.id === Number(form.deliveryMethodId));
    const total = subtotal + (delivery?.price ?? 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSending(true);

        const payload = {
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            deliveryMethodId: Number(form.deliveryMethodId),
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            county: form.county,
            postalCode: form.postalCode,
            paymentMethod: form.paymentMethod,
            notes: form.notes || null,
        };

        try {
            const res = await api.post("/orders", payload);
            clear();
            navigate(`/orders/${res.data.id}`, { state: { placed: true } });
        } catch (err) {
            const data = err.response?.data;
            setError(typeof data === "string" ? data : "Plasarea comenzii a esuat.");
            setSending(false);
        }
    };

    return (
        <div className="checkout">
            <form onSubmit={handleSubmit}>
                <h1>Finalizare comanda</h1>

                <h2>Date de livrare</h2>
                <div>
                    <label htmlFor="fullName">Nume complet</label>
                    <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} autoComplete="name" required />
                </div>
                <div>
                    <label htmlFor="phone">Telefon</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        pattern="[0-9+ ]{10,15}"
                        title="Numar de telefon valid, ex: 0722123456"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address">Adresa (strada, numar, bloc, apartament)</label>
                    <input id="address" name="address" value={form.address} onChange={handleChange} autoComplete="street-address" required />
                </div>
                <div className="form-row">
                    <div>
                        <label htmlFor="city">Localitate</label>
                        <input id="city" name="city" value={form.city} onChange={handleChange} autoComplete="address-level2" required />
                    </div>
                    <div>
                        <label htmlFor="county">Judet</label>
                        <input id="county" name="county" value={form.county} onChange={handleChange} autoComplete="address-level1" required />
                    </div>
                    <div>
                        <label htmlFor="postalCode">Cod postal</label>
                        <input
                            id="postalCode"
                            name="postalCode"
                            pattern="[0-9]{6}"
                            title="Codul postal are 6 cifre"
                            value={form.postalCode}
                            onChange={handleChange}
                            autoComplete="postal-code"
                            required
                        />
                    </div>
                </div>

                <h2>Livrare</h2>
                {!deliveryMethods && !error && <p>Se incarca...</p>}
                {deliveryMethods?.length === 0 && (
                    <p>Produsele din cos nu au nicio modalitate de livrare comuna. Plaseaza comenzi separate.</p>
                )}
                {deliveryMethods?.map((d) => (
                    <label key={d.id} className="choice">
                        <input
                            type="radio"
                            name="deliveryMethodId"
                            value={d.id}
                            checked={Number(form.deliveryMethodId) === d.id}
                            onChange={handleChange}
                            required
                        />
                        {d.name}: {d.price === 0 ? "gratuit" : `${d.price.toFixed(2)} lei`}, {d.estimatedDays}{" "}
                        {d.estimatedDays === 1 ? "zi" : "zile"}
                    </label>
                ))}

                <h2>Plata</h2>
                {["Ramburs", "Card la livrare"].map((m) => (
                    <label key={m} className="choice">
                        <input type="radio" name="paymentMethod" value={m} checked={form.paymentMethod === m} onChange={handleChange} />
                        {m}
                    </label>
                ))}

                <div>
                    <label htmlFor="notes">Observatii (optional)</label>
                    <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} />
                </div>

                <button type="submit" disabled={sending || !deliveryMethods?.length}>
                    {sending ? "Se trimite..." : "Plaseaza comanda"}
                </button>
                {error && <p className="error">{error}</p>}
            </form>

            <aside className="summary">
                <h2>Sumar</h2>
                <ul>
                    {items.map((i) => (
                        <li key={i.productId}>
                            {i.quantity} x {i.name} <span>{(i.price * i.quantity).toFixed(2)} lei</span>
                        </li>
                    ))}
                </ul>
                <p>Subtotal: {subtotal.toFixed(2)} lei</p>
                <p>Livrare: {delivery ? `${delivery.price.toFixed(2)} lei` : "-"}</p>
                <p>
                    Total: <strong>{total.toFixed(2)} lei</strong>
                </p>
                <Link to="/cart">Modifica cosul</Link>
            </aside>
        </div>
    );
}

export default CheckoutPage;
