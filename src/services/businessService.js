import { apiFetch } from './api';

const API_URL = 'https://localhost:7031/api/business'; 

export const businessService = {
    // GET
    getBusiness: async () => {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar información del negocio');
        return await response.json(); // Esto devuelve un Array: [{...}]
    },

    // POST
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

        // Envío de archivo binario
        if (businessData.logoFile) {
            formData.append('Logo', businessData.logoFile);
        }

        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al registrar el negocio');
        }
        return await response.json();
    },

    // PUT
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

        // Solo enviamos 'Logo' si el usuario seleccionó uno nuevo
        if (businessData.logoFile) {
            formData.append('Logo', businessData.logoFile);
        }

        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al actualizar negocio');
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }
};