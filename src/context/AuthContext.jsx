// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getToken, decodeUserFromToken } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificamos si hay token guardado
  useEffect(() => {
    const token = getToken();
    if (token) {
      const userData = decodeUserFromToken(token);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { user } = await loginService(credentials);
    setUser(user); // Actualizamos el estado global
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