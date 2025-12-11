import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, decodeUserFromToken, login as authLogin, logout as authLogout, isTokenExpired } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext();
const USER_DATA_KEY = 'userData';
const API_BASE_URL = 'https://localhost:7031'; // URL de tu API para las imágenes

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        authLogout();
        localStorage.removeItem(USER_DATA_KEY);
        setUser(null);
    };

    // --- FUNCIÓN INTELIGENTE: NORMALIZAR DATOS ---
    const normalizeUserData = (apiUser, tokenUser) => {
        // 1. FOTO: Normalizar URL (Local vs Web)
        let photoUrl = apiUser.photo || apiUser.Photo || apiUser.photoUrl || apiUser.PhotoUrl || "";
        if (photoUrl) {
            if (photoUrl.includes("Uploads")) {
                const cleanPath = photoUrl.replace(/\\/g, '/');
                const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                photoUrl = `${API_BASE_URL}/${pathPart}`; // Agregamos dominio
            } else if (!photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
                photoUrl = `data:image/jpeg;base64,${photoUrl}`; // Asumimos base64 si no tiene formato
            }
        }

        // 2. ROL: Obtener nombre del array o fallback al token
        // La API suele devolver roles: ["Administrador"]
        const rolesList = apiUser.roles || apiUser.Roles;
        const roleName = (rolesList && rolesList.length > 0) ? rolesList[0] : (tokenUser?.role || "Usuario");

        // 3. NOMBRES
        const fName = apiUser.firstName || apiUser.FirstName || tokenUser?.firstName || "";
        const lName = apiUser.lastName || apiUser.LastName || tokenUser?.lastName || "";

        return {
            ...tokenUser, // Mantenemos claims del token (id, exp, etc)
            ...apiUser,   // Sobrescribimos con datos frescos de DB
            id: apiUser.id || apiUser.Id || tokenUser.id,
            firstName: fName,
            lastName: lName,
            name: `${fName} ${lName}`.trim(),
            email: apiUser.email || apiUser.Email || tokenUser.email,
            photo: photoUrl, // URL Correcta
            role: roleName,  // Nombre Correcto (no ID)
            initials: (fName.charAt(0) + lName.charAt(0)).toUpperCase() || "U"
        };
    };

    // --- FUNCIÓN PARA RECARGAR DESDE API ---
    const refreshUser = async () => {
        const token = getToken();
        if (!token) return;
        
        try {
            const tokenData = decodeUserFromToken(token);
            if (!tokenData || !tokenData.id) return;

            // Consultamos la versión más reciente a la BD
            const apiData = await userService.getById(tokenData.id);
            
            // Mezclamos y normalizamos
            const freshUser = normalizeUserData(apiData, tokenData);
            
            setUser(freshUser);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(freshUser));
        } catch (error) {
            console.error("Error refrescando usuario:", error);
        }
    };

    const login = async (credentials) => {
        const data = await authLogin(credentials);
        // Al loguear, intentamos obtener datos completos de inmediato
        const tokenUser = decodeUserFromToken(data.token);
        setUser(tokenUser); // Estado inicial rápido
        
        // Hidratación asíncrona (traer foto y rol real)
        try {
            const apiData = await userService.getById(tokenUser.id);
            const freshUser = normalizeUserData(apiData, tokenUser);
            setUser(freshUser);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(freshUser));
        } catch (e) {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(tokenUser));
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token && !isTokenExpired(token)) {
                // 1. Intentar cargar de caché local (rápido)
                const stored = localStorage.getItem(USER_DATA_KEY);
                if (stored) {
                    setUser(JSON.parse(stored));
                    // Opcional: refrescar en segundo plano para asegurar datos frescos
                    // refreshUser(); 
                } else {
                    // 2. Si no hay caché, decodificar y buscar en API
                    const tokenData = decodeUserFromToken(token);
                    setUser(tokenData);
                    await refreshUser(); 
                }
            } else {
                if (token) logout();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);