import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/discounts';

export const discountService = {
    // Obtener todos los descuentos
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
    },

    // Crear descuento
    create: async (data) => {
        // data: { reason: "Buen Fin", percentage: 10, isActive: true }
        const response = await api.post(BASE_ENDPOINT, data);
        return response.data;
    },

    // Actualizar descuento
    update: async (id, data) => {
        // data: { id: 1, reason: "...", percentage: ... }
        const response = await api.put(`${BASE_ENDPOINT}/${id}`, data);
        return response.data;
    },

    // Eliminar (Si tu backend lo soporta, agrego la función por si acaso)
    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    }
};