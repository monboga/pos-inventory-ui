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

    getAll: async (page = 1, pageSize = 10, searchTerm = '', status = 'All') => {
        try {
            // Enviamos los params correctamente query string
            const response = await api.get(BASE_ENDPOINT, {
                params: { 
                    pageNumber: page, 
                    pageSize, 
                    searchTerm, 
                    status: status === 'All' ? null : status 
                }
            });
            // Retorna { items: [], totalCount: 0, totalPages: 0 ... }
            return response.data;
        } catch (error) {
            console.error(error);
            return { items: [], totalCount: 0, totalPages: 0 };
        }
    },

    getById: async (id) => {
        const response = await api.get(`${BASE_ENDPOINT}/${id}`);
        return response.data;
    },

    // 1. Confirmar (Pendiente -> Confirmado)
    confirmOrder: async (id, payload = null) => {
        // Payload por defecto para cumplir con el DTO del Backend
        const defaultPayload = {
            orderTypeId: 1, // 1: Pickup (Valor seguro por defecto)
            ...payload
        };

        try {
            // El segundo argumento es el body. Al enviarlo, axios pone Content-Type: application/json
            const response = await api.put(`${BASE_ENDPOINT}/${id}/confirm`, defaultPayload);
            return response.data;
        } catch (error) {
            throw new Error('No se pudo confirmar la orden.');
        }
    },

    // 2. Enviar (Confirmado -> En Camino)
    markAsIncoming: async (id) => {
        try {
            const response = await api.put(`${BASE_ENDPOINT}/${id}/incoming`);
            return response.data;
        } catch (error) {
            throw new Error('No se pudo marcar como en camino.');
        }
    },

    // 3. Procesar Venta (En Camino/Confirmado -> Completado)
    // Payload: { orderId, userId }
    processToSale: async (processData) => {
        try {
            const response = await api.post(`${BASE_ENDPOINT}/process`, processData);
            return response.data; // { saleId, message }
        } catch (error) {
            // Extraemos el mensaje de error limpio del backend (ValidationException/ConflictException)
            const backendError = error.response?.data?.detail || error.response?.data?.title || 'Error al procesar venta';
            throw new Error(backendError);
        }
    },

    cancel: async (id) => {
        await api.post(`${BASE_ENDPOINT}/${id}/cancel`);
        return true;
    }
};