import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/users'; 

export const userService = {
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
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

        try {
            // --- FIX CRÍTICO: ESPECIFICAR HEADER MULTIPART ---
            const response = await api.post(BASE_ENDPOINT, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            let msg = errorData.message || errorData.title || "Error al crear el usuario";
            
            if (errorData.errors) {
                const details = Object.entries(errorData.errors)
                    .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                    .join(' | ');
                msg += ` (${details})`;
            }
            throw new Error(msg);
        }
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

        // En Update NO enviamos password, ya que no hay campo en el modal
        
        try {
            // --- FIX CRÍTICO: ESPECIFICAR HEADER MULTIPART ---
            const response = await api.put(`${BASE_ENDPOINT}/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            let msg = errorData.message || errorData.title || "Error al actualizar";
            if (errorData.errors) {
                const details = Object.entries(errorData.errors)
                    .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                    .join(' | ');
                msg += ` (${details})`;
            }
            throw new Error(msg);
        }
    },

    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    },

    getById: async (id) => {
        const response = await api.get(`${BASE_ENDPOINT}/${id}`);
        return response.data;
    }
};