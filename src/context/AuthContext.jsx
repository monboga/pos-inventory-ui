// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Asegúrate de que la ruta a authService sea correcta
import { login as loginService, logout as logoutService, getToken, decodeUserFromToken } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Función CLAVE: Busca los datos completos del usuario usando el Token como llave.
   */
  const fetchRealUserData = async (email, tokenData, rawToken) => {
    try {
      // 1. IMPORTANTE: Incluimos el token en los headers
      const response = await fetch('https://localhost:7031/api/users', {
        headers: {
          'Authorization': `Bearer ${rawToken}`, // <--- ESTO FALTABA
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`No se pudo obtener lista de usuarios. Status: ${response.status}`);
        return tokenData; // Si falla, usamos el fallback del token
      }
      
      const users = await response.json();
      
      // 2. Buscamos al usuario que coincida con el email
      // Ajustamos para que coincida mayúsculas/minúsculas
      const foundUser = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());

      if (foundUser) {
        console.log("Usuario real encontrado en DB:", foundUser); // Para depurar

        // 3. Detectamos nombres según cómo vengan en tu API (FirstName o fullName)
        const realName = foundUser.fullName || 
                         (foundUser.firstName && foundUser.lastName ? `${foundUser.firstName} ${foundUser.lastName}` : null) || 
                         foundUser.firstName || 
                         tokenData.name;

        // 4. Retornamos la fusión de datos
        return {
          ...tokenData, // Mantenemos datos técnicos del token (expiración, etc)
          ...foundUser, // Sobrescribimos con datos reales (roles, foto, etc)
          name: realName, 
          // Aseguramos que el rol sea un string legible si viene como array
          role: Array.isArray(foundUser.roles) ? foundUser.roles[0] : (foundUser.roles || tokenData.role),
          initials: (foundUser.firstName?.[0] || "") + (foundUser.lastName?.[0] || "") || tokenData.initials
        };
      }
    } catch (error) {
      console.error("Error buscando detalles del usuario:", error);
    }
    return tokenData;
  };

  // Carga inicial (F5 / Recarga)
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        const decoded = decodeUserFromToken(token);
        // Si tenemos email y token, intentamos buscar sus datos reales
        if (decoded?.email) {
            const realUser = await fetchRealUserData(decoded.email, decoded, token);
            setUser(realUser);
        } else {
            setUser(decoded);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Función de Login
  const login = async (credentials) => {
    // 1. Obtenemos el token básico
    const { token, user: tokenUser } = await loginService(credentials);
    
    // 2. Inmediatamente usamos ese token para buscar los datos reales "FirstName + LastName"
    const realUser = await fetchRealUserData(tokenUser.email, tokenUser, token);
    
    setUser(realUser);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);