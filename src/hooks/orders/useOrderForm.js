import { useState } from 'react';
import { useOrderCart } from './useOrderCart';
import { useOrderCalculations } from './useOrderCalculations';
import { useOrderSubmit } from './useOrderSubmit';
import toast from 'react-hot-toast';

export const useOrderForm = (onSuccess, onClose) => {
    // 1. Integración de Hooks Atómicos
    const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useOrderCart();
    const { orderSummary } = useOrderCalculations(cart);
    const { submitOrder, loading, lastOrder, isSuccessOpen, resetOrderState } = useOrderSubmit(onSuccess);

    // 2. Estado Local del Formulario (Contacto)
    const [contact, setContact] = useState({ 
        name: '', 
        phone: '',
        isDelivery: false,
        street: '',
        externalNumber: '',
        neighborhood: ''
    });
    
    // 3. Estado de UI (Modal Confirmación)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // --- Validaciones para la UI ---
    const isValidName = contact.name.trim().length > 0;
    const isValidPhone = contact.phone.replace(/\D/g, '').length === 10;
    
    const canSubmit = 
        cart.length > 0 &&
        isValidName &&
        isValidPhone &&
        (!contact.isDelivery || (contact.street && contact.neighborhood));

    // --- Handlers ---
    
    const handlePhoneChange = (val) => {
        // Solo permitir números
        const numericVal = val.replace(/\D/g, '');
        if (numericVal.length <= 10) {
            setContact(prev => ({ ...prev, phone: numericVal }));
        }
    };

    const requestCheckout = () => {
        if (!canSubmit) {
            toast.error("Completa los datos de contacto y agrega productos.");
            return;
        }
        setIsCheckoutOpen(true);
    };

    const confirmOrder = async () => {
        const success = await submitOrder(cart, contact);
        if (success) {
            setIsCheckoutOpen(false);
            clearCart();
            setContact({ name: '', phone: '', isDelivery: false, street: '', externalNumber: '', neighborhood: '' });
        }
    };

    const startNewOrder = () => {
        resetOrderState();
        // Opcional: si quisieras cerrar todo el modal principal
        // onClose(); 
    };

    // Retornamos la interfaz unificada que espera OrderModal
    return {
        // Datos
        cart,
        contact,
        setContact,
        orderSummary,
        lastOrder,
        
        // UI States
        loading,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isSuccessOpen,
        
        // Validaciones (NUEVAS)
        isValidName,
        isValidPhone,
        canSubmit,

        // Acciones
        addToCart,
        updateQuantity,
        removeFromCart,
        handlePhoneChange,
        requestCheckout,
        confirmOrder,
        startNewOrder
    };
};