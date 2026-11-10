import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { formatDate } from "../utils/format";

const AWAITING_PAYMENT = "In asteptarea platii";

function OrderDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    // ?paid=1 si ?canceled=1 vin de la Stripe, dupa pagina de plata
    const returnedPaid = searchParams.get("paid") === "1";
    const returnedCanceled = searchParams.get("canceled") === "1";

    const [result, setResult] = useState({ id: null, order: null, error: null, payment: null });
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            let payment = null;
            if (returnedPaid) {
                try {
                    const res = await api.post(`/orders/${id}/confirm-payment`);
                    if (!ignore) setResult({ id, order: res.data, error: null, payment: "confirmed" });
                    return;
                } catch {
                    payment = "pending";
                }
            }
            try {
                const res = await api.get(`/orders/${id}`);
                if (!ignore) setResult({ id, order: res.data, error: null, payment });
            } catch {
                if (!ignore) setResult({ id, order: null, error: "Comanda nu a fost gasita.", payment: null });
            }
        };
        load();

        return () => {
            ignore = true;
        };
    }, [id, returnedPaid]);

    const handlePay = async () => {
        setPaying(true);
        setPayError(null);
        try {
            const res = await api.post(`/orders/${id}/pay`);
            window.location.href = res.data.url;
        } catch (err) {
            const data = err.response?.data;
            setPayError(typeof data === "string" ? data : "Nu am putut porni plata.");
            setPaying(false);
        }
    };

    if (result.id !== id) return <p>Se incarca...</p>;
    if (result.error) {
        return (
            <div>
                <p>{result.error}</p>
                <Link to="/orders">Inapoi la comenzi</Link>
            </div>
        );
    }

    const { order } = result;

    return (
        <div>
            <Link to="/orders">&larr; Inapoi la comenzi</Link>

            {location.state?.placed && (
                <p className="notice">Multumim! Comanda ta a fost plasata cu succes.</p>
            )}
            {result.payment === "confirmed" && (
                <p className="notice">Plata a fost confirmata. Multumim pentru comanda!</p>
            )}
            {result.payment === "pending" && (
                <p className="error">Plata nu a fost inca confirmata de Stripe. Reincarca pagina in cateva secunde.</p>
            )}
            {returnedCanceled && order.status === AWAITING_PAYMENT && (
                <p className="error">Plata a fost anulata. Poti incerca din nou mai jos.</p>
            )}
            {location.state?.payFailed && (
                <p className="error">Comanda a fost plasata, dar nu am putut porni plata. Incearca din nou mai jos.</p>
            )}

            <h1>Comanda #{order.id}</h1>
            <p>
                Plasata pe {formatDate(order.createdAt)} &middot; <span className="badge">{order.status}</span>
            </p>

            {order.status === AWAITING_PAYMENT && (
                <div className="buy-box">
                    <button type="submit" onClick={handlePay} disabled={paying}>
                        {paying ? "Se deschide Stripe..." : `Plateste ${order.total.toFixed(2)} lei cu cardul`}
                    </button>
                    {payError && <span className="error">{payError}</span>}
                </div>
            )}

            <table>
                <thead>
                    <tr>
                        <th>Produs</th>
                        <th>Pret unitar</th>
                        <th>Cantitate</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((i, idx) => (
                        <tr key={idx}>
                            <td>
                                {i.productId ? <Link to={`/products/${i.productId}`}>{i.productName}</Link> : i.productName}
                            </td>
                            <td>{i.unitPrice.toFixed(2)} lei</td>
                            <td>{i.quantity}</td>
                            <td>{(i.unitPrice * i.quantity).toFixed(2)} lei</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="order-info">
                <div>
                    <h3>Livrare</h3>
                    <p>
                        {order.fullName}
                        <br />
                        {order.phone}
                        <br />
                        {order.address}
                        <br />
                        {order.city}, jud. {order.county}, {order.postalCode}
                    </p>
                    <p>
                        {order.deliveryName} ({order.deliveryPrice.toFixed(2)} lei)
                    </p>
                    {order.notes && <p>Observatii: {order.notes}</p>}
                </div>
                <div>
                    <h3>Plata</h3>
                    <p>{order.paymentMethod === "Card" ? "Card online" : order.paymentMethod}</p>
                    {order.paidAt && <p>Platita pe {formatDate(order.paidAt)}</p>}
                    <p>Subtotal: {order.subtotal.toFixed(2)} lei</p>
                    <p>Livrare: {order.deliveryPrice.toFixed(2)} lei</p>
                    <p>
                        Total: <strong className="price">{order.total.toFixed(2)} lei</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;
