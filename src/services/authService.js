import { jwtDecode } from "jwt-decode";

const API_BASE_URL = 'https://localhost:7031/api/auth';
const TOKEN_KEY = 'authToken';

// --- GESTIÓN DE TOKEN ---
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userData'); // Limpiamos caché también
};

// Validación simple de expiración
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

// --- ENDPOINTS ---

export const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Credenciales inválidas');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data; 
};

// NUEVO: Obtener datos del usuario actual desde el Backend
export const getCurrentUser = async () => {
    const token = getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    if (!response.ok) {
        throw new Error('Error obteniendo información del usuario');
    }

    return await response.json();
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!response.ok) throw new Error('Error al enviar solicitud.');
    return true;
};

export const resetPassword = async (data) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al restablecer contraseña.');
    return true;
};