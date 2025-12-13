import { useAuth } from '../context/AuthContext';

export const usePermission = (requiredPermission) => {
    const { user } = useAuth();

    // 1. Si no hay usuario o no hay permiso requerido, falso
    if (!user || !requiredPermission) return false;

    // 2. Verificamos si el array de permisos incluye el string solicitado
    const hasPermission = user.permissions.includes(requiredPermission);

    return hasPermission;
};