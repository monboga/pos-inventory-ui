import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/Clients'; 

export const clientService = {
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
    },

    create: async (clientData) => {
        try {
            const response = await api.post(BASE_ENDPOINT, clientData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || 'Error al crear cliente');
        }
    },

    update: async (id, clientData) => {
        try {
            const response = await api.put(`${BASE_ENDPOINT}/${id}`, { ...clientData, id });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || 'Error al actualizar cliente');
        }
    },

    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    }
};