import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/business'; 

export const businessService = {
    getBusiness: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data; 
    },

    create: async (businessData) => {
        const formData = new FormData();
        formData.append('Rfc', businessData.rfc);
        formData.append('RazonSocial', businessData.legalName);
        formData.append('Email', businessData.email);
        formData.append('Address', businessData.address);
        formData.append('PhoneNumber', businessData.phoneNumber);
        formData.append('PostalCode', businessData.postalCode);
        formData.append('CurrencyType', businessData.currencyType || 'MXN');
        formData.append('RegimenFiscalId', businessData.regimenFiscalId);

        if (businessData.logoFile) {
            formData.append('Logo', businessData.logoFile);
        }

        try {
            // --- FIX: HEADER MULTIPART ---
            const response = await api.post(BASE_ENDPOINT, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || 'Error al registrar el negocio');
        }
    },

    update: async (id, businessData) => {
        const formData = new FormData();
        formData.append('Id', id);
        formData.append('Rfc', businessData.rfc);
        formData.append('RazonSocial', businessData.legalName);
        formData.append('Email', businessData.email);
        formData.append('Address', businessData.address);
        formData.append('PhoneNumber', businessData.phoneNumber);
        formData.append('PostalCode', businessData.postalCode);
        formData.append('CurrencyType', businessData.currencyType || 'MXN');
        formData.append('RegimenFiscalId', businessData.regimenFiscalId);

        if (businessData.logoFile) {
            formData.append('Logo', businessData.logoFile);
        }

        try {
            // --- FIX: HEADER MULTIPART ---
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