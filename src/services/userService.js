import { apiFetch } from "./api";

const API_URL = 'https://localhost:7031/api/users'; 

export const userService = {
    getAll: async () => {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar usuarios');
        return await response.json();
    },

    create: async (userData) => {
        const formData = new FormData();
        
        formData.append('FirstName', userData.firstName);
        formData.append('LastName', userData.lastName);
        formData.append('Email', userData.email);
        formData.append('Password', userData.password);
        formData.append('Roles', userData.role); 
        formData.append('IsActive', true);

        if (userData.photoFile) {
            formData.append('Photo', userData.photoFile);
        }

        // Ya no necesitamos headers manuales, api.js lo maneja
        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let msg = errorData.title || "Error al crear";
            if (errorData.errors) {
                const details = Object.entries(errorData.errors)
                    .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                    .join(' | ');
                msg += ` (${details})`;
            }
            throw new Error(msg);
        }
        return await response.json();
    },

    update: async (id, userData) => {
        const formData = new FormData();
        
        formData.append('Id', id); 
        formData.append('FirstName', userData.firstName);
        formData.append('LastName', userData.lastName);
        formData.append('Email', userData.email);
        formData.append('Roles', userData.role);
        // Asegurar booleano
        formData.append('IsActive', userData.isActive);

        if (userData.photoFile) {
             formData.append('Photo', userData.photoFile);
        }

        if (userData.password && userData.password.trim() !== "") {
            formData.append('Password', userData.password);
        }

        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let msg = errorData.title || "Error al actualizar";
            if (errorData.errors) {
                const details = Object.entries(errorData.errors)
                    .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                    .join(' | ');
                msg += ` (${details})`;
            }
            throw new Error(msg);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {}; 
    },

    delete: async (id) => {
        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar usuario');
        return true;
    }
};