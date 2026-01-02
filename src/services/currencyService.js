import api from '../api/axiosConfig';

const ENDPOINT = '/api/CurrencyType';

export const currencyService = {
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data;
        } catch (error) {
            console.error("Error fetching currencies:", error);
            return [];
        }
    }
};