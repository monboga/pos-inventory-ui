import axios from 'axios';

// 1. Crear instancia
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Rutas donde NO queremos que nos redirija al login si falla la autenticación
const PUBLIC_ROUTES = ['/store', '/track', '/login', '/register', '/forgot-password', '/reset-password'];

// 2. INTERCEPTOR DE SOLICITUDES
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. INTERCEPTOR DE RESPUESTAS
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Detectar si estamos en una ruta pública
        const currentPath = window.location.pathname;
        const isPublicPage = PUBLIC_ROUTES.some(route => currentPath.startsWith(route));

        if (error.response && error.response.status === 401) {
            console.warn("Token inválido o expirado detectado.");

            // CASO A: Estamos en una página PÚBLICA (Tienda, Tracking)
            if (isPublicPage) {
                // Solo borramos el token corrupto para que las siguientes peticiones 
                // vayan limpias (como invitado) y NO redirigimos.
                localStorage.removeItem('authToken');
                localStorage.removeItem('user'); // Si guardas info del usuario, bórrala también
                
                // Opcional: Recargar la página para limpiar el estado de React (AuthProvider)
                // y que la UI se renderice como "Invitado".
                // window.location.reload(); 
            } 
            // CASO B: Estamos en una ruta PROTEGIDA (Dashboard, Ventas)
            else {
                console.warn("Redirigiendo al login...");
                localStorage.clear();
                if (!currentPath.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;