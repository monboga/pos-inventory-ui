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
      const response = await fetch('https://localhost:7031/api/users', {
        headers: {
          'Authorization': `Bearer ${rawToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return tokenData;
      }

      const users = await response.json();

      // Buscamos usuario ignorando mayúsculas/minúsculas en el email
      const foundUser = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());

      if (foundUser) {
        // --- AQUÍ ESTÁ EL FIX ---
        // 1. Intentamos leer las propiedades sin importar si vienen en Mayúscula o Minúscula
        // ( .NET a veces devuelve PascalCase 'FirstName' aunque JS prefiera camelCase )
        let fName = foundUser.firstName || foundUser.FirstName || "";
        let lName = foundUser.lastName || foundUser.LastName || "";
        const fullNameFromApi = foundUser.fullName || foundUser.FullName || "";

        // 2. PLAN B: Si firstName/lastName vienen vacíos, pero tenemos fullName,
        // intentamos separarlos nosotros mismos.
        if ((!fName || !lName) && fullNameFromApi) {
          const nameParts = fullNameFromApi.split(' ');
          if (!fName) fName = nameParts[0]; // Primer palabra
          if (!lName) lName = nameParts.slice(1).join(' '); // Resto del string
        }

        // 3. PLAN C: Fallback al nombre del token si todo lo demás falla
        const finalName = fullNameFromApi ||
          (fName && lName ? `${fName} ${lName}` : null) ||
          tokenData.name;

        let avatar = null;
        if (foundUser.photo) {
          // Si ya viene con prefijo data:image, lo dejamos, si no, lo agregamos (asumiendo jpeg/png)
          avatar = foundUser.photo.startsWith('data:')
            ? foundUser.photo
            : `data:image/jpeg;base64,${foundUser.photo}`;
        } else if (foundUser.photoUrl) {
          avatar = foundUser.photoUrl;
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
          photo: avatar // <--- PROPIEDAD NORMALIZADA
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