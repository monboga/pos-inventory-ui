import { useState } from 'react';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const useOrderSubmit = (onSuccessMain) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const submitOrder = async (cart, contact) => {
        setLoading(true);
        try {
            const payload = {
                source: 1, // POS
                userId: user?.id,
                contactName: contact.name,
                contactPhone: contact.phone,
                contactStreet: contact.isDelivery ? contact.street : null,
                contactExternalNumber: contact.isDelivery ? contact.externalNumber : null,
                contactNeighborhood: contact.isDelivery ? contact.neighborhood : null,
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity }))
            };

            const response = await orderService.create(payload);
            const createdId = response?.id || response;
            
            // Obtenemos el detalle completo para el ticket (Folio, items, etc)
            const officialOrder = await orderService.getById(createdId);

            // Preparamos datos para el modal de éxito
            setLastOrder({
                id: officialOrder.id,
                orderNumber: officialOrder.orderNumber,
                total: officialOrder.total,
                items: officialOrder.items || []
            });

            setIsSuccessOpen(true);
            
            if (onSuccessMain) onSuccessMain();
            
            return true; // Éxito

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al crear pedido");
            return false; // Fallo
        } finally {
            setLoading(false);
        }
    };

    const resetOrderState = () => {
        setIsSuccessOpen(false);
        setLastOrder(null);
    };

    return { 
        submitOrder, 
        loading, 
        lastOrder, 
        isSuccessOpen, 
        resetOrderState 
    };
};