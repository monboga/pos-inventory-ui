import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/Orders';

export const orderService = {
    // ==========================================
    // 🌎 MÉTODOS PÚBLICOS (Cliente Externo)
    // ==========================================

    /**
     * Crea un nuevo pedido (Puede ser anónimo o registrado).
     * @param {Object} orderData - { source: 1|2, items: [], contactName?, contactPhone? }
     */
    create: async (orderData) => {
        try {
            // Nota: El backend permite acceso anónimo a este endpoint
            const response = await api.post(BASE_ENDPOINT, orderData);
            return response.data; // Retorna el ID de la orden (int)
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.message || 'Error al crear el pedido.');
        }
    },

    /**
     * Rastrea el estatus de un pedido mediante doble verificación.
     * @param {string} orderNumber - Ej. ORD-00050
     * @param {string} phone - Teléfono de seguridad
     */
    trackOrder: async (orderNumber, phone) => {
        try {
            // Endpoint: GET /api/Orders/track?orderNumber=...&phone=...
            const response = await api.get(`${BASE_ENDPOINT}/track`, {
                params: { orderNumber, phone }
            });
            return response.data; // Retorna PublicOrderDto
        } catch (error) {
            throw new Error('No pudimos localizar tu orden. Verifica el número y el teléfono.');
        }
    },

    // ==========================================
    // 🔒 MÉTODOS PRIVADOS (Gestión Interna / POS)
    // ==========================================

    /**
     * Obtiene el listado de todas las órdenes (para el Dashboard).
     */
    getAll: async () => {
        try {
            const response = await api.get(BASE_ENDPOINT);
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    /**
     * Obtiene el detalle completo de una orden por ID interno.
     */
    getById: async (id) => {
        try {
            const response = await api.get(`${BASE_ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Error al cargar el detalle de la orden.');
        }
    },

    /**
     * Convierte una Orden confirmada en una Venta Fiscal.
     * @param {Object} processData - { orderId, userId, documentTypeId, paymentMethodId }
     */
    processToSale: async (processData) => {
        try {
            // Endpoint: POST /api/Orders/process
            const response = await api.post(`${BASE_ENDPOINT}/process`, processData);
            return response.data; // Retorna { saleId, message }
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.message || 'Error al procesar la venta.');
        }
    },

    /**
     * Cancela manualmente una orden (liberando stock).
     * (Asumiendo que implementaremos un endpoint DELETE o PUT /cancel en el futuro si se requiere manual)
     */
    cancel: async (id) => {
        try {
            await api.delete(`${BASE_ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw new Error('No se pudo cancelar la orden.');
        }
    }
};