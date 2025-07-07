// src/context/AuthContext.jsx

// Se importan las funciones necesarias de React.
import React, { createContext, useState, useContext } from 'react';

// Se crea el Contexto de Autenticación.
const AuthContext = createContext(null);

// Se define el proveedor del contexto, que contendrá la lógica de estado.
export function AuthProvider({ children }) {
    // Se utiliza useState para almacenar la información del usuario. 'null' significa que no hay sesión iniciada.
    const [user, setUser] = useState(null);

    // --- Se define un usuario de demostración ---
    const demoUser = {
        name: 'Nombre Apellido',
        email: 'usuario@dominio.com',
        initials: 'NA',
    };

    // Función para iniciar sesión.
    const login = (email, password) => {
        // En una aplicación real, aquí se haría una llamada a una API.
        // Por ahora, se valida con datos fijos.
        if (email === 'demo@user.com' && password === 'password') {
            // Si las credenciales son correctas, se establece el usuario en el estado.
            setUser(demoUser);
            // Se retorna 'true' para indicar que el inicio de sesión fue exitoso.
            return true;
        }
        // Si las credenciales son incorrectas, se retorna 'false'.
        return false;
    };

    // Función para cerrar sesión.
    const logout = () => {
        // Se elimina la información del usuario del estado.
        setUser(null);
    };

    // Se empaquetan los valores que el proveedor pondrá a disposición de sus hijos.
    const value = { user, login, logout };

    // El componente retorna el Proveedor del Contexto, envolviendo a los componentes hijos.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Se crea un "hook" personalizado para consumir fácilmente el contexto en otros componentes.
export function useAuth() {
    return useContext(AuthContext);
}