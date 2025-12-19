import axios from 'axios';

// 1. Crear instancia con la URL base del .env
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR DE SOLICITUDES (Request)
// Antes de que salga la petición, le pegamos el token automáticamente viaja.
api.interceptors.request.use(
    (config) => {
        // Buscamos la misma clave que usamos en authService
        const token = localStorage.getItem('authToken'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. INTERCEPTOR DE RESPUESTAS (Response) - AQUÍ ESTÁ LA SOLUCIÓN AL CRASH
api.interceptors.response.use(
    (response) => response, // Si todo sale bien, pasa la respuesta
    (error) => {
        // Si el error es 401 (Token vencido o Backend reiniciado)
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o inválida. Cerrando sesión...");
            
            // A. Limpiamos almacenamiento local
            localStorage.clear(); 
            
            // B. Redirigimos forzosamente al Login
            // Usamos window.location para asegurar un refresh limpio y romper cualquier loop de React
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;