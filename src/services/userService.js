import { getToken } from './authService';

const API_URL = 'https://localhost:7031/api/users'; 

const getJsonHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const getFormDataHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`
        // NO poner Content-Type, el navegador lo pone con el boundary
    };
};

export const userService = {
    getAll: async () => {
        const response = await fetch(API_URL, { headers: getJsonHeaders() });
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

        // --- ENVIAMOS EL ARCHIVO BINARIO ---
        if (userData.photoFile) {
            // El nombre 'Photo' debe coincidir con la propiedad IFormFile Photo en tu DTO
            formData.append('Photo', userData.photoFile);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getFormDataHeaders(),
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
        formData.append('IsActive', userData.isActive);

        if (userData.photoFile) {
             formData.append('Photo', userData.photoFile);
        }

        if (userData.password && userData.password.trim() !== "") {
            formData.append('Password', userData.password);
        }

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getFormDataHeaders(),
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
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getJsonHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar usuario');
        return true;
    }
};