import { useState } from 'react';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

export const useOrderTracking = () => {
    // Estado inicial limpio
    const [searchParams, setSearchParams] = useState({ orderNumber: '', phone: '' });
    const [orderResult, setOrderResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Inputs handlers (Validaciones visuales)
    const handleOrderInput = (val) => {
        // Solo permitimos números porque el prefijo ORD- es visual/automático
        const numericVal = val.replace(/[^0-9]/g, '');
        setSearchParams(prev => ({ ...prev, orderNumber: numericVal }));
    };

    const handlePhoneInput = (val) => {
        const numericVal = val.replace(/[^0-9]/g, '');
        if (numericVal.length <= 10) {
            setSearchParams(prev => ({ ...prev, phone: numericVal }));
        }
    };

    // LOGICA PRINCIPAL
    const handleTrack = async (e) => {
        e.preventDefault();

        if (!searchParams.orderNumber || searchParams.phone.length < 10) {
            toast.error("Ingresa el número de orden y un teléfono válido.");
            return;
        }

        setLoading(true);
        setOrderResult(null);

        try {
            // 2. FORMATEO CRÍTICO: Convertir "50" -> "ORD-00050"
            // El usuario escribe "50", nosotros rellenamos ceros y agregamos prefijo
            const formattedOrderNumber = `ORD-${searchParams.orderNumber.padStart(5, '0')}`;

            const data = await orderService.trackOrder(formattedOrderNumber, searchParams.phone);

            setOrderResult(data);

        } catch (err) {
            console.error("❌ Error en Tracking:", err);            
            // FIX DOBLE TOAST:
            // Si el error ya viene del servicio con mensaje, lo usamos.
            // Si tienes un interceptor global que ya muestra alertas, comenta la línea de abajo.
            const msg = err.message || "No encontramos una orden con esos datos.";
            
            // Solo mostramos toast si el error no fue cancelado o manejado globalmente
            toast.error(msg, { id: 'tracking-error' }); // 'id' previene duplicados visuales en hot-toast
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setOrderResult(null);
        setSearchParams({ orderNumber: '', phone: '' });
    };

    return {
        searchParams,
        handleOrderInput,
        handlePhoneInput,
        handleTrack,
        clearSearch,
        orderResult,
        loading
    };
};