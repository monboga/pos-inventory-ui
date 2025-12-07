import { apiFetch } from './api';

const API_URL = 'https://localhost:7031/api/Clients'; 

export const clientService = {
    getAll: async () => {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar clientes');
        return await response.json();
    },

    create: async (clientData) => {
        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(clientData)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al crear cliente');
        }
        return await response.json();
    },

    update: async (id, clientData) => {
        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...clientData, id }) 
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al actualizar cliente');
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    },

    delete: async (id) => {
        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar cliente');
        return true;
    }
};