import { apiFetch } from './api';

const API_URL = 'https://localhost:7031/api/Sales';

export const saleService = {
    getAll: async () => {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar el historial de ventas');
        return await response.json();
    },

    getById: async (id) => {
        const response = await apiFetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Error al cargar el detalle de la venta');
        return await response.json();
    },

    create: async (saleData) => {
        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(saleData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || error.message || 'Error al procesar la venta');
        }
        return await response.json();
    },

    getPdf: async (id) => {
        // apiFetch ya inyecta el Token de autorización
        const response = await apiFetch(`${API_URL}/${id}/pdf`);
        
        if (!response.ok) {
            throw new Error('Error al generar el PDF del comprobante');
        }
        
        // Retornamos el Blob (archivo binario)
        return await response.blob();
    }
};