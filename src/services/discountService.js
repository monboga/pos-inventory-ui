import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/discounts';

export const discountService = {
    // Obtener todos los descuentos
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data; // Retorna lista de DiscountVm (incluyendo minQuantity)
    },

    // Crear descuento
    create: async (data) => {
        // data espera: { reason: string, percentage: number, minQuantity: number | null, isActive: boolean }
        const response = await api.post(BASE_ENDPOINT, data);
        return response.data;
    },

    // Actualizar descuento
    update: async (id, data) => {
        // data espera: { id, reason, percentage, minQuantity, isActive }
        const response = await api.put(`${BASE_ENDPOINT}/${id}`, data);
        return response.data;
    },

    // Eliminar
    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    }
};