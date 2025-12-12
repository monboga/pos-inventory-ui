import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, login as authLogin, logout as authLogout, getCurrentUser, isTokenExpired } from '../services/authService';

const AuthContext = createContext();
const USER_DATA_KEY = 'userData';
const API_BASE_URL = 'https://localhost:7031'; // Para prefijo de imágenes

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- FUNCIÓN DE NORMALIZACIÓN (MAPEO) ---
    // Convierte la respuesta del endpoint /me en un objeto listo para usar en el UI
    const normalizeUser = (apiUser) => {
        if (!apiUser) return null;

        // 1. Nombres (Manejo de PascalCase o camelCase)
        const fName = apiUser.firstName || apiUser.FirstName || "";
        const lName = apiUser.lastName || apiUser.LastName || "";
        // Si no hay nombres, usar el inicio del email
        const fullName = (fName || lName) 
            ? `${fName} ${lName}`.trim() 
            : (apiUser.email || apiUser.Email || "").split('@')[0];

        // 2. Foto
        let photoUrl = apiUser.photo || apiUser.Photo || apiUser.photoUrl || apiUser.PhotoUrl || "";
        if (photoUrl) {
            // Si es ruta relativa de servidor
            if (photoUrl.includes("Uploads")) {
                const cleanPath = photoUrl.replace(/\\/g, '/');
                const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                photoUrl = `${API_BASE_URL}/${pathPart}`;
            } 
            // Si es string base64 sin cabecera (común en .NET byte[])
            else if (!photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
                photoUrl = `data:image/jpeg;base64,${photoUrl}`;
            }
        }

        // 3. Rol (El endpoint /me debería devolver los nombres de los roles)
        const rolesList = apiUser.roles || apiUser.Roles;
        // Tomamos el primer rol o un default
        const roleName = (Array.isArray(rolesList) && rolesList.length > 0) ? rolesList[0] : "Usuario";

        return {
            id: apiUser.id || apiUser.Id,
            firstName: fName,
            lastName: lName,
            name: fullName, 
            email: apiUser.email || apiUser.Email,
            photo: photoUrl,
            role: roleName, // Ahora debe ser el Nombre (ej. "Administrador")
            initials: (fName.charAt(0) + (lName.charAt(0) || "")).toUpperCase() || "U"
        };
    };

    const logout = () => {
        authLogout();
        localStorage.removeItem(USER_DATA_KEY);
        setUser(null);
    };

    // Función para recargar datos frescos desde el Backend
    const refreshUser = async () => {
        try {
            const apiUser = await getCurrentUser(); // Llama a /api/auth/me
            const cleanUser = normalizeUser(apiUser);
            setUser(cleanUser);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(cleanUser));
        } catch (error) {
            console.warn("No se pudo refrescar sesión:", error);
            // Si el token es inválido, logout
            if (error.message.includes("401")) logout();
        }
    };

    const login = async (credentials) => {
        // 1. Obtener Token
        await authLogin(credentials);
        // 2. Obtener Perfil inmediatamente
        await refreshUser();
    };

    const updateUser = (newData) => {
        setUser((prev) => {
            const updated = { ...prev, ...newData };
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token && !isTokenExpired(token)) {
                // Carga optimista de caché
                const cached = localStorage.getItem(USER_DATA_KEY);
                if (cached) setUser(JSON.parse(cached));
                
                // Validación y refresco de fondo
                await refreshUser();
            } else {
                logout();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, updateUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);