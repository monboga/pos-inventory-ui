import { getToken } from './authService';

const API_URL = 'https://localhost:7031/api/Clients'; // Ajusta puerto si varía

const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const clientService = {
    getAll: async () => {
        const response = await fetch(API_URL, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Error al cargar clientes');
        return await response.json();
    },

    create: async (clientData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(clientData)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al crear cliente');
        }
        return await response.json();
    },

    update: async (id, clientData) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...clientData, id }) // Aseguramos ID en body
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al actualizar cliente');
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar cliente');
        return true;
    }
};