import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useOrderCart = () => {
    const [cart, setCart] = useState([]);

    const addToCart = useCallback((product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                // Validación simple de stock
                if (exists.quantity >= (product.stock || 999)) {
                    toast.error("Stock insuficiente");
                    return prev;
                }
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            // Inicializamos con cantidad 1
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success("Producto agregado");
    }, []);

    const updateQuantity = useCallback((productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id !== productId) return item;
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }));
    }, []);

    const removeFromCart = useCallback((id) => {
        setCart(prev => prev.filter(p => p.id !== id));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    return { cart, addToCart, updateQuantity, removeFromCart, clearCart };
};