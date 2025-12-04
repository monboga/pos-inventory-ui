// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getToken, decodeUserFromToken } from '../services/authService';

const AuthContext = createContext();

// 1. DEFINIMOS LA URL BASE (Igual que en UsersPage)
const API_BASE_URL = 'https://localhost:7031'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE RECUPERACIÓN DE DATOS ---
  const fetchRealUserData = async (email, tokenData, rawToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${rawToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return tokenData; 
      }
      
      const users = await response.json();
      
      // Buscamos usuario
      const foundUser = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());

      if (foundUser) {
        // A. Nombres
        let fName = foundUser.firstName || foundUser.FirstName || "";
        let lName = foundUser.lastName || foundUser.LastName || "";
        const fullNameFromApi = foundUser.fullName || foundUser.FullName || "";

        if ((!fName || !lName) && fullNameFromApi) {
            const parts = fullNameFromApi.trim().split(' ');
            if (!fName && parts.length > 0) fName = parts[0];
            if (!lName && parts.length > 1) lName = parts.slice(1).join(' ');
        }

        const finalName = fullNameFromApi || (fName && lName ? `${fName} ${lName}` : null) || tokenData.name;

        // --- B. FIX IMAGEN (IGUAL QUE EN USERSPAGE) ---
        let avatar = null;
        // Buscamos en todas las posibles propiedades
        const rawPhoto = foundUser.photo || foundUser.Photo || foundUser.photoUrl || foundUser.PhotoUrl;

        if (rawPhoto) {
            // 1. Si es ruta relativa del Backend (Uploads\Users\...)
            if (rawPhoto.includes("Uploads")) {
                const cleanPath = rawPhoto.replace(/\\/g, '/');
                const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                avatar = `${API_BASE_URL}/${pathPart}`;
            } 
            // 2. Si es URL web o Base64
            else if (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:')) {
                avatar = rawPhoto;
            } 
            // 3. Fallback Base64 puro
            else {
                avatar = `data:image/jpeg;base64,${rawPhoto}`;
            }
        }

        return {
            ...tokenData, 
            ...foundUser, 
            name: finalName, 
            firstName: fName, 
            lastName: lName,  
            email: foundUser.email || foundUser.Email,
            role: Array.isArray(foundUser.roles) ? foundUser.roles[0] : (foundUser.roles || tokenData.role),
            initials: (fName?.[0] || "") + (lName?.[0] || "") || tokenData.initials,
            photo: avatar // <--- Aquí ya va la URL completa
        };
      }
    } catch (error) {
        console.error("Error buscando detalles del usuario:", error);
    }
    return tokenData;
  };

  // Carga inicial
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        const decoded = decodeUserFromToken(token);
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

  const login = async (credentials) => {
    const { token, user: tokenUser } = await loginService(credentials);
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