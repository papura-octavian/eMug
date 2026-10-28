import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

// cosul se tine in localStorage, deci se pastreaza si fara cont
export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.productId === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.productId === product.id
                        ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                        : i
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    stock: product.stock,
                    quantity: Math.min(quantity, product.stock),
                },
            ];
        });
    };

    const updateQuantity = (productId, quantity) => {
        setItems((prev) =>
            prev.map((i) =>
                i.productId === productId
                    ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
                    : i
            )
        );
    };

    const removeItem = (productId) =>
        setItems((prev) => prev.filter((i) => i.productId !== productId));

    const clear = () => setItems([]);

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, count, subtotal, addItem, updateQuantity, removeItem, clear }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
