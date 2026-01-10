import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';

export function useProfileForm(user, refreshUser) {
    const [isLoading, setIsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    
    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });

    // 1. Sincronizar estado local cuando cambia el usuario (Contexto)
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || user.FirstName || '',
                lastName: user.lastName || user.LastName || '',
                email: user.email || user.Email || '',
                role: user.role || user.Role || 'Usuario'
            });
            // Si el backend devuelve photoUrl, lo usamos
            setPhotoPreview(user.photoUrl || user.photo || null);
            console.log
        }
    }, [user]);

    // 2. Manejo de Foto (Local Preview)
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // 3. Envío de Datos (Update)
    const updateProfile = async (e) => {
        if (e) e.preventDefault();
        
        const toastId = toast.loading("Actualizando perfil...");
        setIsLoading(true);

        try {
            // Mapeamos camelCase a las propiedades que espera tu userService/API
            const dataToUpdate = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: formData.role, // Necesario si el endpoint lo valida
                isActive: true,      // Mantenemos activo al usuario
                photoFile: photoFile // El archivo raw
            };

            // Llamamos al servicio (Usamos 'update' ya que 'updateProfile' no existía en tu archivo userService)
            await userService.update(user.id, dataToUpdate);

            // CRÍTICO: Refrescamos el contexto para que la UI global se entere del cambio
            if (refreshUser) {
                await refreshUser();
            }

            toast.success("Perfil actualizado correctamente", { id: toastId });
            setPhotoFile(null); // Limpiamos el archivo pendiente

        } catch (error) {
            console.error("Update Error:", error);
            toast.error(error.message || "No se pudo actualizar el perfil", { id: toastId });
            // Lanzamos el error para que el componente UI sepa que falló (y no cierre el modo edición)
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        photoPreview,
        handlePhotoChange,
        updateProfile,
        isLoading
    };
}