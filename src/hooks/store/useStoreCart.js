import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { getItemFinancials } from '../../utils/financials';

export function useStoreCart() {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [contact, setContact] = useState({ name: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.total += fin.lineTotal;
            acc.savings += fin.savings;
            return acc;
        }, { total: 0, savings: 0 });
    }, [cart]);

    const addToCart = (product) => {
        const id = product.id || product.Id;
        const currentQty = cart.find(i => i.id === id)?.quantity || 0;
        
        // Verificación de stock robusta
        if (currentQty >= Number(product.stock ?? product.Stock ?? 0)) return;

        setCart(prev => {
            const exist = prev.find(i => i.id === id);
            return exist
                ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...product, id, quantity: 1 }];
        });
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                source: 2, // Web
                contactName: contact.name,
                contactPhone: contact.phone,
                items: cart.map(item => {
                    const fin = getItemFinancials(item);
                    return { productId: item.id, quantity: item.quantity, unitPrice: fin.unitPrice };
                }),
                total: orderSummary.total
            };
            await orderService.create(payload);
            toast.success("Pedido enviado con éxito");
            setCart([]);
            setIsCheckoutModalOpen(false);
            setTimeout(() => window.close(), 1000);
        } catch (error) { 
            toast.error("Error al procesar pedido"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    // Acciones del carrito
    const updateQuantity = (id, delta) => {
        setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
    };

    const removeFromCart = (id) => {
        setCart(p => p.filter(i => i.id !== id));
    };

    return {
        cart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        contact,
        setContact,
        isSubmitting,
        orderSummary,
        addToCart,
        handleConfirmOrder,
        updateQuantity,
        removeFromCart
    };
}