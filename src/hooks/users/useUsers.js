import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- NORMALIZACIÓN (Lógica movida aquí) ---
    const normalizeUser = useCallback((rawUser) => {
        let fName = rawUser.firstName || rawUser.FirstName || "";
        let lName = rawUser.lastName || rawUser.LastName || "";
        const fullNameFromApi = rawUser.fullName || rawUser.FullName || "";
        const email = rawUser.email || rawUser.Email || "";

        if ((!fName || !lName) && fullNameFromApi) {
            const parts = fullNameFromApi.trim().split(' ');
            if (!fName && parts.length > 0) fName = parts[0];
            if (!lName && parts.length > 1) lName = parts.slice(1).join(' ');
        }

        let normalizedPhoto = "";
        const rawPhoto = rawUser.photo || rawUser.Photo || rawUser.photoUrl || rawUser.PhotoUrl;

        if (rawPhoto) {
            if (rawPhoto.includes("Uploads")) {
                const cleanPath = rawPhoto.replace(/\\/g, '/');
                const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                normalizedPhoto = `${API_BASE_URL}/${pathPart}`;
            } else if (rawPhoto.startsWith('data:') || rawPhoto.startsWith('http')) {
                normalizedPhoto = rawPhoto;
            } else {
                normalizedPhoto = `data:image/jpeg;base64,${rawPhoto}`;
            }
        }

        return {
            id: rawUser.id || rawUser.Id,
            firstName: fName,
            lastName: lName,
            email: email,
            photo: normalizedPhoto,
            roles: rawUser.roles || rawUser.Roles || ["Usuario"],
            isActive: rawUser.isActive !== undefined ? rawUser.isActive : rawUser.IsActive
        };
    }, []);

    // --- CARGA ---
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            const cleanData = data.map(normalizeUser);
            setUsers(cleanData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    }, [normalizeUser]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    // --- ACCIONES (Guardar) ---
    const saveUser = async (formData, currentUser, onSuccess) => {
        const toastId = toast.loading("Guardando usuario...");
        try {
            if (currentUser) {
                await userService.update(currentUser.id, formData);
                toast.success("Usuario actualizado", { id: toastId });
            } else {
                await userService.create(formData);
                toast.success("Usuario creado", { id: toastId });
            }
            if (onSuccess) onSuccess();
            loadUsers();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    // --- ACCIONES (Eliminar - Lógica interna) ---
    const performDelete = async (id) => {
        const toastId = toast.loading("Procesando...");
        try {
            await userService.delete(id);
            toast.success("Usuario procesado", { id: toastId });
            loadUsers();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    return {
        users,
        loading,
        loadUsers,
        saveUser,
        performDelete
    };
}