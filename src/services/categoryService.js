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
        // --- FIX: Mapeo a PascalCase para que el Backend lo lea correctamente ---
        const payload = {
            Description: categoryData.description,
            // Si permites elegir estado al crear, úsalo; si no, true por defecto.
            IsActive: categoryData.isActive !== undefined ? categoryData.isActive : true 
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload) // Enviamos el payload mapeado
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al crear categoría');
        }
        return await response.json();
    },

    update: async (id, categoryData) => {
        // --- FIX: Mapeo manual para asegurar que IsActive se envíe ---
        // Al transformar las llaves a Mayúscula (PascalCase), .NET las reconoce automáticamente.
        const payload = { 
            Id: id,
            Description: categoryData.description || categoryData.Description, // Fallback seguro
            IsActive: categoryData.isActive // Aquí enviamos el booleano correcto
        };
        
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