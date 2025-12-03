import { jwtDecode } from "jwt-decode"; // Importante: librería para leer el token

// Ajusta la URL si tu puerto cambia, pero mantén el endpoint correcto
const API_AUTH_URL = 'https://localhost:7031/api/auth/login'; 
const TOKEN_KEY = 'authToken';

/**
 * Inicia sesión en el servidor.
 * @param {object} credentials - Objeto con { email, password }
 * @returns {Promise<{token: string, user: object}>} - Devuelve token y datos de usuario
 */
export const login = async (credentials) => {
  // Petición POST a tu API .NET
  const response = await fetch(API_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Convertimos el objeto { email, password } a JSON string
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    // Si la API devuelve error (ej. 401, 400), lanzamos una excepción
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciales inválidas o error en el servidor.');
  }

  // Obtenemos la respuesta exitosa (ej. { token: "eyJ..." })
  const data = await response.json();
  const token = data.token;
  
  // Guardamos el token en localStorage para persistencia
  localStorage.setItem(TOKEN_KEY, token);

  // RETORNO CLAVE: Devolvemos objeto con token Y usuario decodificado
  // Esto permite que el AuthContext actualice el estado inmediatamente.
  return {
    token,
    user: decodeUserFromToken(token) 
  }; 
};

/**
 * Obtiene el token almacenado.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Cierra la sesión eliminando el token.
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Decodifica el token JWT para extraer información del usuario.
 * @param {string} token - El token JWT
 * @returns {object|null} - Objeto con datos del usuario o null si falla
 */
export const decodeUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    
    // --- 1. Lógica de Nombres (Ya la tenías) ---
    const email = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.unique_name || "";
    
    let firstName = decoded.firstName || decoded.given_name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
    let lastName = decoded.lastName || decoded.family_name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"];

    // Fallback para nombre si no viene en token
    if (!firstName && email && email.includes('@')) {
        const namePart = email.split('@')[0]; 
        if (namePart.includes('.')) {
            const parts = namePart.split('.');
            firstName = capitalize(parts[0]);
            lastName = capitalize(parts[1]);
        } else {
            firstName = capitalize(namePart);
        }
    }

    const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (firstName || email || "Usuario");
    
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    let initials = (firstInitial + lastInitial);
    if (!initials && email) initials = email.charAt(0).toUpperCase();

    // --- 2. NUEVA LÓGICA PARA EL ROL ---
    // Buscamos el rol en las llaves estándar de Microsoft o en claves simples
    const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.roles;
    
    let userRole = "Usuario"; // Valor por defecto

    if (roleClaim) {
        if (Array.isArray(roleClaim)) {
            // Si tiene múltiples roles (ej. ["Admin", "Ventas"]), mostramos el primero o los unimos
            userRole = roleClaim[0]; 
        } else {
            // Si es un solo string
            userRole = roleClaim;
        }
    }

    return {
      name: fullName,
      email: email,
      initials: initials || "U",
      role: userRole // <--- Agregamos esto al objeto final
    };

  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}