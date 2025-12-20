import { jwtDecode } from "jwt-decode";
import api from '../api/axiosConfig'; // Asegúrate de que este archivo exista en src/api/

const TOKEN_KEY = 'authToken';

// --- GESTIÓN DE TOKEN ---
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userData');
};

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// --- ENDPOINTS (MIGRADO A AXIOS) ---

export const login = async (credentials) => {
    // Axios maneja JSON y Headers automáticos
    const response = await api.post('/api/auth/login', credentials);
    const data = response.data;

    // Guardamos el token INMEDIATAMENTE para que la siguiente petición (/me) lo encuentre
    localStorage.setItem(TOKEN_KEY, data.token);

    return data;
};

export const getCurrentUser = async () => {
    // El interceptor en axiosConfig.js leerá 'authToken' del localStorage
    // y lo inyectará en el header Authorization automáticamente.
    const response = await api.get('/api/auth/me');
    return response.data;
};

export const forgotPassword = async (email) => {
    await api.post('/api/auth/forgot-password', { email });
    return true;
};

export const resetPassword = async (data) => {
    await api.post('/api/auth/reset-password', data);
    return true;
};

export const changePassword = async (newPassword) => {
    try {
        // Enviamos solo newPassword porque tu ChangePasswordCommand en el BE 
        // solo tiene UserId (del token) y NewPassword.
        const response = await api.post('/api/auth/change-password', {
            newPassword: newPassword
        });
        return response.data;
    } catch (error) {
        // Extraemos el mensaje exacto que manda tu Backend (ej. "La contraseña debe tener...")
        const errorMessage = error.response?.data?.message || "Error al cambiar la contraseña";
        throw new Error(errorMessage);
    }
};