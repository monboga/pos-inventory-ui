import { useState } from 'react';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

export const useOrderTracking = () => {
    const [searchParams, setSearchParams] = useState({ orderNumber: '', phone: '' });
    const [orderResult, setOrderResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Formateador inteligente para la UI (Solo permite números en el input visual)
    const handleOrderInput = (val) => {
        // Removemos "ORD-" si el usuario intenta escribirlo, y cualquier no-dígito
        const numericVal = val.replace(/[^0-9]/g, '');
        setSearchParams(prev => ({ ...prev, orderNumber: numericVal }));
    };

    const handlePhoneInput = (val) => {
        const numericVal = val.replace(/[^0-9]/g, '');
        if (numericVal.length <= 10) {
            setSearchParams(prev => ({ ...prev, phone: numericVal }));
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        
        if (!searchParams.orderNumber || searchParams.phone.length < 10) {
            toast.error("Por favor completa los campos correctamente");
            return;
        }

        setLoading(true);
        setError(null);
        setOrderResult(null);

        try {
            // 1. Formateo estricto para el Backend: 50 -> ORD-00050
            const formattedOrderNumber = `ORD-${searchParams.orderNumber.padStart(5, '0')}`;
            
            // 2. Llamada al servicio
            const data = await orderService.trackOrder(formattedOrderNumber, searchParams.phone);
            if (!data) throw new Error("Orden no encontrada");
            
            setOrderResult(data);
        } catch (err) {
            console.error(err);
            setError("No encontramos una orden con esos datos. Verifica e intenta de nuevo.");
            toast.error("Orden no encontrada");
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setOrderResult(null);
        setSearchParams({ orderNumber: '', phone: '' });
        setError(null);
    };

    return {
        searchParams,
        handleOrderInput,
        handlePhoneInput,
        handleTrack,
        clearSearch,
        orderResult,
        loading,
        error
    };
};