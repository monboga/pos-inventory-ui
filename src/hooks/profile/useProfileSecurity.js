import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { changePassword } from '../../services/authService'; // Asegúrate de tener este servicio o importarlo correctamente
import {validatePassword } from '../../utils/validators';

export function useProfileSecurity(user, logout) {
    const [isLoading, setIsLoading] = useState(false);
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const changeUserPassword = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }
        const validation = validatePassword(passData.newPassword);
        if (!validation.isValid) {
            // Si falla aquí, el toast será consistente con la UI
            toast.error(`La contraseña no cumple: ${validation.message}`);
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Actualizando contraseña...");

        try {
            await changePassword(passData.newPassword);
            
            toast.success("Contraseña actualizada. Inicia sesión de nuevo.", { id: toastId });
            
            // UX: Cerrar sesión para forzar re-login con nueva pass
            if (logout) {
                setTimeout(() => logout(), 1500);
            }
            
            // Limpiar formulario
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al cambiar contraseña", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        passData,
        setPassData,
        changeUserPassword,
        isLoading
    };
}