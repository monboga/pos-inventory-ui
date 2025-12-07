import { getToken, logout } from './authService';

/**
 * Wrapper inteligente para fetch.
 * - Maneja Token automáticamente.
 * - Maneja Error 401 (Logout).
 * - Maneja Content-Type para JSON vs FormData.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    
    // Base headers
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    // Solo agregamos 'application/json' si NO estamos enviando FormData.
    // Si es FormData, dejamos que el navegador ponga el Content-Type (multipart/form-data + boundary).
    if (!(options.body instanceof FormData)) {
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
    }

    try {
        const response = await fetch(endpoint, {
            ...options,
            headers
        });

        // Interceptor de Error 401 (Token Vencido o Inválido)
        if (response.status === 401) {
            console.warn("Sesión caducada (401). Cerrando sesión...");
            logout(); 
            window.location.href = '/login'; 
            return; 
        }

        return response;
    } catch (error) {
        throw error;
    }
};