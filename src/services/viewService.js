import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/Views';

export const viewService = {
    getViewsByEntity: async (resource) => {
        try {
            const response = await api.get(`${BASE_ENDPOINT}/${resource}`);
            return response.data;
        } catch (e) {
            return [];
        }
    },

    createView: async (viewData) => {
        try {
            const response = await api.post(BASE_ENDPOINT, viewData);
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            if (errorData.errors) {
                const details = Object.entries(errorData.errors)
                    .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                    .join(' | ');
                throw new Error(details);
            }
            throw new Error(errorData.title || "Error al guardar la vista");
        }
    },

    deleteView: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
    }
};