import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { getItemFinancials } from '../../utils/financials';

// Contexto de usuario
import { useAuth } from '../../context/AuthContext';

export const useOrderForm = (onSuccessMain, onCloseMain) => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();
    
    // Estado inicial de contacto, incluyendo campos de dirección
    const [contact, setContact] = useState({ 
        name: '', 
        phone: '',
        isDelivery: false,
        street: '',
        externalNumber: '',
        neighborhood: ''
    });
    
    const [loading, setLoading] = useState(false);
    
    // Modales internos
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    // --- Acciones Carrito ---
    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                // Validación stock simple
                if (exists.quantity >= (product.stock || 999)) {
                    toast.error("Stock insuficiente");
                    return prev;
                }
                return prev.map(p => p.id === product.id ? {...p, quantity: p.quantity + 1} : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success("Producto agregado", { position: 'bottom-center' });
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id !== productId) return item;
            const newQty = item.quantity + delta;
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

    // --- Confirmar Orden ---
    const confirmOrder = async () => {
        if (cart.length === 0) return;
        
        setLoading(true);
        try {
            // 1. Payload para CREAR (Lo que enviamos)
            const payload = {
                source: 1,
                clientId: null,
                userId: user?.id, 
                contactName: contact.name,
                contactPhone: contact.phone,
                contactStreet: contact.isDelivery ? contact.street : null,
                contactExternalNumber: contact.isDelivery ? contact.externalNumber : null,
                contactNeighborhood: contact.isDelivery ? contact.neighborhood : null,
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity }))
            };

            // 2. CREAR EL PEDIDO
            const response = await orderService.create(payload);
            
            // Aseguramos obtener el ID (ya sea que el back devuelva un int directo o un objeto)
            const createdId = response?.id || response; 

            // 3. OBTENER EL DETALLE OFICIAL (GET BY ID)
            // Esto es vital para obtener el "Folio 89" y los items procesados
            const officialOrder = await orderService.getById(createdId);

            // 4. Preparar datos para el Modal de Éxito
            const successData = {
                id: officialOrder.id,
                orderNumber: officialOrder.orderNumber, // Aquí viene la secuencia (Ej. "00089")
                total: officialOrder.total,
                // Mapeamos los items para asegurar que el modal los entienda
                items: (officialOrder.items || []).map(item => ({
                    productName: item.productName || item.name, // Ajuste de seguridad por si cambia el nombre del campo
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total || (item.unitPrice * item.quantity),
                    discountTotal: item.discountTotal || 0
                }))
            };

            setLastOrder(successData);
            
            // Transiciones UI
            setIsCheckoutOpen(false);
            setIsSuccessOpen(true);
            setCart([]);
            setContact({ name: '', phone: '', isDelivery: false, street: '', externalNumber: '', neighborhood: '' });
            
            if (onSuccessMain) onSuccessMain();

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al crear pedido");
        } finally {
            setLoading(false);
        }
    };

    // Funciones auxiliares
    const requestCheckout = () => setIsCheckoutOpen(true);
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
        
        // Modal State
        isCheckoutOpen,
        setIsCheckoutOpen,
        isSuccessOpen,
        lastOrder,
        
        requestCheckout,
        confirmOrder,
        startNewOrder
    };
};