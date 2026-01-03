import { useMemo } from 'react';

export const useCheckoutForm = (contact, setContact, cartLength) => {
    
    // 1. Wrapper para actualizar campos limpiamente
    const updateContact = (key, val) => {
        if (setContact) {
            setContact(prev => ({ ...prev, [key]: val }));
        }
    };

    // 2. Reglas de Validación
    const isValid = useMemo(() => {
        // Datos básicos
        const hasName = (contact?.name || '').trim().length > 0;
        const hasPhone = (contact?.phone || '').length === 10;
        const validBasic = hasName && hasPhone;

        // Dirección (solo si es delivery)
        let validAddress = true;
        if (contact?.isDelivery) {
            const hasStreet = (contact?.street || '').trim().length > 0;
            const hasCol = (contact?.neighborhood || '').trim().length > 0;
            validAddress = hasStreet && hasCol;
        }

        // Carrito no vacío
        const hasItems = cartLength > 0;

        return hasItems && validBasic && validAddress;
    }, [contact, cartLength]);

    return { 
        updateContact, 
        canCheckout: isValid 
    };
};