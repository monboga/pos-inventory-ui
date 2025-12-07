import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, decodeUserFromToken, login as authLogin, logout as authLogout, isTokenExpired } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función Centralizada de Logout
    const logout = () => {
        authLogout(); // Borra de localStorage
        setUser(null);
    };

    // Función de Login
    const login = async (credentials) => {
        const data = await authLogin(credentials);
        setUser(data.user);
    };

    useEffect(() => {
        const checkAuth = () => {
            const token = getToken();
            
            // 1. Verificamos si hay token y si NO ha expirado
            if (token && !isTokenExpired(token)) {
                const userData = decodeUserFromToken(token);
                setUser(userData);
            } else {
                // Si no hay token o YA EXPIRÓ, limpiamos sesión
                if (token) logout(); // Solo hacemos logout si había un token vencido
            }
            setLoading(false);
        };

        checkAuth();

        // 2. Intervalo de Seguridad: Revisar cada 1 minuto
        const intervalId = setInterval(() => {
            const token = getToken();
            if (token && isTokenExpired(token)) {
                console.warn("Sesión expirada. Cerrando sesión...");
                logout();
                // Opcional: window.location.reload() para asegurar limpieza total
            }
        }, 60000); // 60,000 ms = 1 minuto

        return () => clearInterval(intervalId);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);