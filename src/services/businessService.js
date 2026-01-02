import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/business'; 

export const businessService = {
    getBusiness: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data; 
    },

    // Ahora recibe el FormData ya construido desde el Hook
    create: async (formData) => {
        try {
            const response = await api.post(BASE_ENDPOINT, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || 'Error al registrar el negocio');
        }
    },

    // Ahora recibe el FormData ya construido desde el Hook
    update: async (id, formData) => {
        try {
            // Aseguramos que el ID vaya en la URL, el resto en el cuerpo
            const response = await api.put(`${BASE_ENDPOINT}/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || 'Error al actualizar negocio');
        }
    }
};