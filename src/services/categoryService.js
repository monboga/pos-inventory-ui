import { getToken } from './authService';

// Ajusta la URL si es necesario
const API_URL = 'https://localhost:7031/api/categories'; 

const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const categoryService = {
    getAll: async () => {
        const response = await fetch(API_URL, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Error al cargar categorías');
        return await response.json();
    },

    create: async (categoryData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al crear categoría');
        }
        return await response.json();
    },

    update: async (id, categoryData) => {
        // Aseguramos enviar el ID en el cuerpo si el DTO lo pide
        const payload = { ...categoryData, id };
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al actualizar categoría');
        }
        
        // Manejo de respuesta vacía o JSON
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar categoría');
        return true;
    }
};