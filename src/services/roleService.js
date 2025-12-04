import { getToken } from './authService';

const API_URL = 'https://localhost:7031/api/roles'; 

export const roleService = {
    getAll: async () => {
        const token = getToken();
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                console.warn("No se pudo obtener roles de la API.");
                return []; 
            }
            
            const data = await response.json();
            // Devolvemos el array de objetos tal cual viene de la API: 
            // Ej: [{ id: "guid-123", name: "Admin" }, ...]
            return data; 
        } catch (error) {
            console.error("Error en roleService:", error);
            return [];
        }
    }
};