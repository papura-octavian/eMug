import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

// lista de favorite e salvata pe server, per utilizator
export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [data, setData] = useState({ email: null, ids: [] });

    useEffect(() => {
        if (!user) return;
        let ignore = false;

        api
            .get("/wishlist")
            .then((res) => {
                if (!ignore) setData({ email: user.email, ids: res.data.map((w) => w.productId) });
            })
            .catch(() => {});

        return () => {
            ignore = true;
        };
    }, [user]);

    // daca s-a schimbat utilizatorul, lista veche nu mai e valabila
    const ids = user && data.email === user.email ? data.ids : [];

    const isFavorite = (productId) => ids.includes(productId);

    const toggle = async (productId) => {
        if (isFavorite(productId)) {
            await api.delete(`/wishlist/${productId}`);
            setData((prev) => ({ ...prev, ids: prev.ids.filter((id) => id !== productId) }));
        } else {
            await api.post(`/wishlist/${productId}`);
            setData((prev) => ({ ...prev, ids: [...prev.ids, productId] }));
        }
    };

    return (
        <WishlistContext.Provider value={{ ids, isFavorite, toggle }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
