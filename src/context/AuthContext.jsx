import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, login as authLogin, logout as authLogout, getCurrentUser, isTokenExpired } from '../services/authService';

const AuthContext = createContext();
const USER_DATA_KEY = 'userData';

// Usamos la variable de entorno para que sea dinámico
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031'; 

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- NORMALIZADOR DE DATOS ---
    const normalizeUser = (apiUser) => {
        if (!apiUser) return null;

        const fName = apiUser.firstName || apiUser.FirstName || "";
        const lName = apiUser.lastName || apiUser.LastName || "";
        const fullName = (fName || lName) 
            ? `${fName} ${lName}`.trim() 
            : (apiUser.email || apiUser.Email || "").split('@')[0];

        let photoUrl = apiUser.photo || apiUser.Photo || apiUser.photoUrl || apiUser.PhotoUrl || "";
        if (photoUrl) {
            if (photoUrl.includes("Uploads")) {
                const cleanPath = photoUrl.replace(/\\/g, '/');
                const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                photoUrl = `${API_BASE_URL}/${pathPart}`;
            } 
            else if (!photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
                photoUrl = `data:image/jpeg;base64,${photoUrl}`;
            }
        }

        // --- FIX: LEER ARRAY DE ROLES ---
        // El backend devuelve "roles": ["Administrador"]
        const rolesList = apiUser.roles || apiUser.Roles || [];
        
        // Tomamos el primer rol de la lista, o "Usuario" si la lista está vacía
        const roleName = rolesList.length > 0 ? rolesList[0] : "Usuario";

        return {
            id: apiUser.id || apiUser.Id,
            firstName: fName,
            lastName: lName,
            name: fullName, 
            email: apiUser.email || apiUser.Email,
            photo: photoUrl,
            role: roleName, // <--- Aquí ya tendrá el valor correcto "Administrador"
            initials: (fName.charAt(0) + (lName.charAt(0) || "")).toUpperCase() || "U",
            permissions: apiUser.permissions || apiUser.Permissions || []
        };
    };

    const logout = () => {
        authLogout(); // Limpia localStorage
        setUser(null); // Limpia estado de React
    };

    const refreshUser = async () => {
        try {
            // Axios ya inyecta el token automáticamente. 
            // Si falla (401), el interceptor redirige a login.
            const apiUser = await getCurrentUser(); 
            const cleanUser = normalizeUser(apiUser);
            
            setUser(cleanUser);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(cleanUser));
        } catch (error) {
            console.warn("Sesión no válida o expirada.");
            // Si falla la validación, aseguramos que el estado local esté limpio
            setUser(null);
            localStorage.removeItem(USER_DATA_KEY);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            await authLogin(credentials); // Esto guarda el token en localStorage
            await refreshUser();          // Esto usa el token para pedir los datos
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (newData) => {
        setUser((prev) => {
            const updated = { ...prev, ...newData };
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    // --- INICIALIZACIÓN ---
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            
            // 1. Si no hay token, no intentamos nada
            if (!token || isTokenExpired(token)) {
                logout();
                setLoading(false);
                return;
            }

            // 2. Carga Optimista (Para velocidad visual)
            const cached = localStorage.getItem(USER_DATA_KEY);
            if (cached) {
                setUser(JSON.parse(cached));
            }

            // 3. Verificación Real (Background)
            // Si el token es falso o el server se reinició, esto fallará y limpiará al usuario
            await refreshUser();
            
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