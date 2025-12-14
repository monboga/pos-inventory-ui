import { useEffect } from 'react';
import toast, { useToasterStore } from 'react-hot-toast';

/**
 * Hook para limitar el número de notificaciones visibles.
 * @param {number} limit - Número máximo de toasts permitidos (por defecto 1).
 */
export const useToastLimit = (limit = 1) => {
    const { toasts } = useToasterStore();

    useEffect(() => {
        toasts
            .filter((t) => t.visible) // Solo miramos los visibles
            .filter((_, i) => i >= limit) // Si hay más del límite...
            .forEach((t) => toast.dismiss(t.id)); // ... cerramos los sobrantes
    }, [toasts, limit]);
};