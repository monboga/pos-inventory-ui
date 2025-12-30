import { useState } from 'react';
import toast from 'react-hot-toast';

export const usePosCart = () => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        // Normalización defensiva del descuento
        const rawDiscount = product.discount || product.Discount;
        const discountPercentage = Number(product.discountPercentage || product.DiscountPercentage || rawDiscount?.percentage || rawDiscount?.Percentage || 0);
        const minQuantity = Number(rawDiscount?.minQuantity || rawDiscount?.MinQuantity || product.minQuantity || product.MinQuantity || 1);

        const cartItem = {
            ...product, // Heredamos props base
            // Aseguramos props críticas para el carrito
            id: product.id, // Ya viene normalizado del usePosData
            name: product.description,
            price: product.price,
            stock: product.stock,
            
            // Props de descuento
            discountPercentage,
            minQuantity,
            discountId: rawDiscount?.id || rawDiscount?.Id
        };

        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === cartItem.id);

            // Validación Stock Inicial
            if (existing && existing.quantity >= cartItem.stock) {
                toast.error("Stock máximo alcanzado");
                return prevCart;
            }

            if (existing) {
                return prevCart.map(item => 
                    item.id === cartItem.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...cartItem, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, amount) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + amount;
                
                // Validación Stock al actualizar
                if (amount > 0 && newQuantity > item.stock) {
                    toast.error("Stock insuficiente");
                    return item;
                }
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };
};