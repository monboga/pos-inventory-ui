import { jwtDecode } from "jwt-decode"; 

// --- CAMBIO: Definimos la base para poder usar otros endpoints ---
const API_BASE_URL = 'https://localhost:7031/api/auth'; 
const TOKEN_KEY = 'authToken';

export const login = async (credentials) => {
  // Ajustamos para usar la base + endpoint específico
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciales inválidas o error en el servidor.');
  }

  const data = await response.json();
  const token = data.token;
  localStorage.setItem(TOKEN_KEY, token);

  return { token, user: decodeUserFromToken(token) }; 
};

// --- NUEVO: Endpoint para solicitar el correo de recuperación ---
export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) 
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'No se pudo enviar el correo de recuperación.');
    }
    return true; 
};

// --- NUEVO: Endpoint para restablecer la contraseña usando el Token/OTP ---
export const resetPassword = async (data) => {
    // data espera: { email, token, newPassword }
    // Asumimos que tu API espera estos campos. Si son diferentes (ej. "otp" en vez de "token"), ajústalo aquí.
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al restablecer la contraseña.');
    }
    return true;
};

// ... (El resto de funciones: getToken, logout, decodeUserFromToken se mantienen IGUALES) ...
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const logout = () => localStorage.removeItem(TOKEN_KEY);

export const decodeUserFromToken = (token) => {
    // ... Tu lógica de decodificación actual se mantiene intacta ...
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        // ... (resto de tu lógica de nombres y roles) ...
        // Para abreviar en este ejemplo, asumo que copias tu función decodeUserFromToken aquí
        // tal cual me la mostraste en el archivo original.
        
        const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.id || 0;
        const email = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.unique_name || "";
        let firstName = decoded.firstName || decoded.given_name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
        let lastName = decoded.lastName || decoded.family_name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"];
        
        if (!firstName && email && email.includes('@')) {
            const namePart = email.split('@')[0];
            firstName = namePart; // Simplificado para el ejemplo
        }
        const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (firstName || email || "Usuario");
        
        // Rol
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.roles;
        let userRole = Array.isArray(roleClaim) ? roleClaim[0] : (roleClaim || "Usuario");

        return {
            id: Number(userId), 
            name: fullName, 
            email, 
            initials: "U", 
            role: userRole };
    } catch (e) { return null; }
};