// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
// Importamos las funciones asíncronas de tu servicio de autenticación
import { login as apiLogin, logout as apiLogout, getToken } from '../services/authService';

// Se crea el Contexto de Autenticación.
const AuthContext = createContext(null);

// Se define el proveedor del contexto, que contendrá la lógica de estado.
export function AuthProvider({ children }) {
    // user ya no es necesario si solo manejamos el estado de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Efecto que se ejecuta una sola vez al cargar la aplicación
    useEffect(() => {
        const token = getToken(); // Busca el token en localStorage
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // Función ASÍNCRONA para iniciar sesión (llama a la API de .NET)
    const login = async (email, password) => {
        setLoading(true);
        try {
            // Llama a tu función asíncrona que hace la petición a la API
            const token = await apiLogin({ email, password });
            
            // Si hay token, la autenticación fue exitosa
            if (token) {
                setIsAuthenticated(true);
                return true;
            }
        } catch (error) {
            // Propagamos el error de credenciales inválidas para que LoginPage lo muestre
            setIsAuthenticated(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Función para cerrar sesión.
    const logout = () => {
        apiLogout(); // Limpia el token de localStorage
        setIsAuthenticated(false);
    };

    // Se empaquetan los valores que el proveedor pondrá a disposición de sus hijos.
    // user ya no se expone, sino el estado y las funciones.
    const value = { isAuthenticated, loading, login, logout };

    // El componente retorna el Proveedor del Contexto.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Se crea y EXPORTA un "hook" personalizado.
export function useAuth() {
    return useContext(AuthContext);
}