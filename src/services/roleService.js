import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/roles'; 

export const roleService = {
    getAll: async () => {
        try {
            const response = await api.get(BASE_ENDPOINT);
            return response.data;
        } catch (error) {
            console.error("Error en roleService:", error);
            return [];
        }
    }
};