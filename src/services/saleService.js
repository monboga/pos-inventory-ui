import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/Sales';

export const saleService = {
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${BASE_ENDPOINT}/${id}`);
        return response.data;
    },

    create: async (saleData) => {
        try {
            const response = await api.post(BASE_ENDPOINT, saleData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || errorData.message || 'Error al procesar la venta');
        }
    },

    getPdf: async (id) => {
        // Configuramos responseType blob para recibir binarios
        const response = await api.get(`${BASE_ENDPOINT}/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data; // Esto ya es el Blob
    },

    getExcel: async (id) => {
        const response = await api.get(`${BASE_ENDPOINT}/${id}/excel`, {
            responseType: 'blob'
        });
        return response.data;
    },

    exportSales: async (ids, format) => {
        const response = await api.post(`${BASE_ENDPOINT}/export`, 
            { saleIds: ids, format: format },
            { responseType: 'blob' }
        );
        return response.data;
    },
    getTicketPdf: async (id) => {
        // Asegúrate que tu controller tenga la ruta /api/sales/{id}/ticket
        const response = await api.get(`${BASE_ENDPOINT}/${id}/ticket`, {
            responseType: 'blob'
        });
        return response.data;
    }
};