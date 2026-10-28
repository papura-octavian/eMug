import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../api/axios";
import { formatDate } from "../utils/format";

function OrderDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [result, setResult] = useState({ id: null, order: null, error: null });

    useEffect(() => {
        let ignore = false;

        api
            .get(`/orders/${id}`)
            .then((res) => {
                if (!ignore) setResult({ id, order: res.data, error: null });
            })
            .catch(() => {
                if (!ignore) setResult({ id, order: null, error: "Comanda nu a fost gasita." });
            });

        return () => {
            ignore = true;
        };
    }, [id]);

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

            <h1>Comanda #{order.id}</h1>
            <p>
                Plasata pe {formatDate(order.createdAt)} &middot; <span className="badge">{order.status}</span>
            </p>

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
                    <p>{order.paymentMethod}</p>
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
