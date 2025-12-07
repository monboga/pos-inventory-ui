import { getToken } from './authService';

const API_URL = 'https://localhost:7031/api/Sales';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const saleService = {
    // Obtener todas las ventas (Listado)
    getAll: async () => {
        const response = await fetch(API_URL, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error al cargar el historial de ventas');
        return await response.json();
    },

    // Obtener detalle de una venta por ID (Para el Modal)
    getById: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error al cargar el detalle de la venta');
        return await response.json();
    },

    create: async (saleData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(saleData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || error.message || 'Error al procesar la venta');
        }
        return await response.json();
    }
};