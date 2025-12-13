// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ requiredPermission }) {
    const { user, loading, isAuthenticated } = useAuth();

    // 1. Si React aún está leyendo el LocalStorage, mostramos "Cargando"
    // Esto evita que te expulse antes de tiempo.
    if (loading) return <div className="p-10">Verificando permisos...</div>;

    // 2. Si no hay usuario logueado -> Login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // 3. (LA PARTE CLAVE) Verificación de Permiso
    if (requiredPermission) {
        // Verificamos si el array de permisos del usuario incluye el requerido
        if (!user.permissions || !user.permissions.includes(requiredPermission)) {
            // DEBUG: Esto te dirá en la consola por qué te está sacando
            console.warn(`ACCESO DENEGADO. 
                Ruta pide: ${requiredPermission}
                Usuario tiene:`, user.permissions);
            
            // Si falla, te regresa al Dashboard (o a una página 403)
            return <Navigate to="/" replace />;
        }
    }

    // 4. Si pasa todo -> Muestra la página (Outlet)
    return <Outlet />;
}

export default ProtectedRoute;