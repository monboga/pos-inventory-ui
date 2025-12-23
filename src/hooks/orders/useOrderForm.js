import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { getItemFinancials } from '../../utils/financials';

export const useOrderForm = (onSuccessMain, onCloseMain) => {
    const [cart, setCart] = useState([]);
    const [contact, setContact] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);

    // Estados para Modales Internos (Flujo de Confirmación)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    // --- Acciones del Carrito ---
    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            const currentQty = exists ? exists.quantity : 0;
            if (currentQty >= product.stock) {
                toast.error("Stock insuficiente");
                return prev;
            }
            if (exists) {
                return prev.map(p => p.id === product.id ? {...p, quantity: p.quantity + 1} : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id !== productId) return item;
            const newQty = item.quantity + delta;
            if (newQty > item.stock) return item;
            if (newQty < 1) return item; 
            return { ...item, quantity: newQty };
        }));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));

    // --- Cálculos ---
    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.total += fin.lineTotal;
            acc.savings += fin.savings;
            acc.count += item.quantity;
            return acc;
        }, { total: 0, savings: 0, count: 0 });
    }, [cart]);

    // --- Validaciones ---
    const handlePhoneChange = (val) => {
        const numericVal = val.replace(/\D/g, ''); 
        if (numericVal.length <= 10) setContact(prev => ({ ...prev, phone: numericVal }));
    };

    const isValidPhone = contact.phone.length === 0 || contact.phone.length === 10;
    const isValidName = contact.name.trim().length > 0;
    const canSubmit = isValidName && isValidPhone && cart.length > 0;

    // --- PASO 1: Solicitar Checkout (Abre Modal Ticket) ---
    const requestCheckout = () => {
        if (canSubmit) {
            setIsCheckoutOpen(true);
        }
    };

    // --- PASO 2: Confirmar Orden (Llamada API) ---
    const confirmOrder = async () => {
        setLoading(true);
        try {
            const payload = {
                source: 1, // POS/Admin
                contactName: contact.name,
                contactPhone: contact.phone,
                items: cart.map(i => {
                    const fin = getItemFinancials(i);
                    return { 
                        productId: i.id, 
                        quantity: i.quantity,
                        unitPrice: fin.unitPrice 
                    };
                }),
                total: orderSummary.total
            };

            // 1. Crear Orden
            const createResponse = await orderService.create(payload);
            const generatedId = createResponse?.id || createResponse?.Id || createResponse;

            // 2. Obtener Detalle Oficial para el Modal de Éxito
            const officialOrderData = await orderService.getById(generatedId);

            // 3. Mapeo para OrderSuccessModal (Igual que en Store)
            const mappedOrderData = {
                orderNumber: officialOrderData.orderNumber || generatedId,
                total: officialOrderData.total,
                items: (officialOrderData.items || []).map(apiItem => {
                    const localItem = cart.find(c => c.id === apiItem.productId) || {};
                    
                    const quantity = apiItem.quantity;
                    const originalTotal = apiItem.unitPrice * quantity;
                    const discountVal = apiItem.discountTotal || 0;
                    
                    const discountPct = originalTotal > 0 
                        ? Math.round((discountVal / originalTotal) * 100) 
                        : 0;

                    const discountObj = localItem.discount || localItem.Discount || {};
                    const minQty = Number(discountObj.minQuantity || localItem.minQuantity || 1);
                    const isBulkType = minQty > 1;

                    return {
                        name: apiItem.productName,
                        quantity: quantity,
                        unitPrice: apiItem.unitPrice,
                        lineTotal: apiItem.total,
                        discount: discountVal,
                        discountPercentage: discountPct,
                        hasDiscount: discountVal > 0,
                        isBulkType: isBulkType
                    };
                })
            };

            setLastOrder(mappedOrderData);
            
            // 4. Transiciones UI
            setIsCheckoutOpen(false);
            setIsSuccessOpen(true);
            setCart([]);
            setContact({ name: '', phone: '' });
            
            // Notificar al padre (para recargar tabla órdenes si aplica)
            if (onSuccessMain) onSuccessMain();

        } catch (error) {
            console.error(error);
            toast.error("Error al procesar el pedido");
        } finally {
            setLoading(false);
        }
    };

    // Reiniciar para otro pedido sin cerrar el modal principal
    const startNewOrder = () => {
        setIsSuccessOpen(false);
        setLastOrder(null);
    };

    return {
        cart,
        contact,
        setContact,
        loading,
        orderSummary,
        addToCart,
        updateQuantity,
        removeFromCart,
        handlePhoneChange,
        isValidName,
        isValidPhone,
        canSubmit,
        
        // Modal States & Handlers
        isCheckoutOpen,
        setIsCheckoutOpen,
        isSuccessOpen,
        lastOrder,
        requestCheckout, // Abre el primer modal
        confirmOrder,    // Hace el POST y abre el segundo modal
        startNewOrder
    };
};