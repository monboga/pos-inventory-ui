import api from '../api/axiosConfig';

export const storeService = {
    /**
     * Obtiene el catálogo completo (Categorías + Productos)
     * GET api/store/catalog
     */
    getCatalog: async () => {
        try {
            const response = await api.get('/api/store/catalog');
            return response.data; // { categories: [], products: [] }
        } catch (error) {
            console.error("Error fetching catalog:", error);
            throw error;
        }
    },
    getOrder: async (orderId) => {
        try {
            const response = await api.get(`/api/store/orders/${orderId}`);
            return response.data; // Retorna el detalle de la orden
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    },

    /**
     * Procesa el checkout público
     * POST api/store/checkout
     */
    checkout: async (orderPayload) => {
        try {
            const response = await api.post('/api/store/checkout', orderPayload);
            return response.data; // Retorna el OrderId (int)
        } catch (error) {
            console.error("Error processing checkout:", error);
            throw error;
        }
    }
};