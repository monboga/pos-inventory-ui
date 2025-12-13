import { apiFetch } from './api';

const API_URL = 'https://localhost:7031/api/Views';

export const viewService = {
    // Obtener vistas
    getViewsByEntity: async (resource) => {
        // El endpoint espera el resource (ej: 'Users')
        const response = await apiFetch(`${API_URL}/${resource}`);
        if (!response.ok) return [];
        return await response.json();
    },

    // Guardar vista
    createView: async (viewData) => {
        // viewData ya viene con la estructura correcta desde el componente:
        // { name, resource, configurationJson }
        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(viewData)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            // Manejo de errores de validación (400)
            if (error.errors) {
                const details = Object.entries(error.errors)
                    .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                    .join(' | ');
                throw new Error(details);
            }
            throw new Error(error.title || "Error al guardar la vista");
        }
        return await response.json(); // Retorna el ID (int)
    },

    deleteView: async (id) => {
        await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    }
};