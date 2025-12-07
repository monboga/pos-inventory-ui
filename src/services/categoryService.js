import { apiFetch } from './api';

const API_URL = 'https://localhost:7031/api/categories';

export const categoryService = {
    getAll: async () => {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar categorías');
        return await response.json();
    },

    create: async (categoryData) => {
        const payload = {
            Description: categoryData.description,
            IsActive: categoryData.isActive !== undefined ? categoryData.isActive : true
        };

        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al crear categoría');
        }
        return await response.json();
    },

    update: async (id, categoryData) => {
        const payload = {
            Id: id,
            Description: categoryData.description || categoryData.Description,
            IsActive: categoryData.isActive
        };

        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al actualizar categoría');
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};
    },

    delete: async (id) => {
        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar categoría');
        return true;
    }
};