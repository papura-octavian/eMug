import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatDate } from "../utils/format";

function OrdersPage() {
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get("/orders/my")
            .then((res) => setOrders(res.data))
            .catch(() => setError("Nu am putut incarca istoricul comenzilor."));
    }, []);

    if (error) return <p>{error}</p>;
    if (!orders) return <p>Se incarca...</p>;

    return (
        <div>
            <h1>Istoric comenzi</h1>

            {orders.length === 0 ? (
                <p>
                    Nu ai plasat nicio comanda inca. <Link to="/products">Vezi produsele</Link>
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nr.</th>
                            <th>Data</th>
                            <th>Produse</th>
                            <th>Livrare</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{formatDate(o.createdAt)}</td>
                                <td>{o.items.reduce((sum, i) => sum + i.quantity, 0)} buc.</td>
                                <td>{o.deliveryName}</td>
                                <td>{o.total.toFixed(2)} lei</td>
                                <td>
                                    <span className="badge">{o.status}</span>
                                </td>
                                <td>
                                    <Link to={`/orders/${o.id}`}>Detalii</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OrdersPage;
