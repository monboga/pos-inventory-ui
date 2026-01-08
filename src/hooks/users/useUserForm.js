import { useState, useEffect, useRef, useCallback } from 'react';
import { roleService } from '../../services/roleService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

export function useUserForm({ isOpen, userToEdit, onSubmit, onClose }) {
    // --- ESTADOS ---
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    
    // Referencia para el input de archivo
    const fileInputRef = useRef(null);

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- CARGA DE ROLES (Solo una vez cuando se abre) ---
    useEffect(() => {
        const fetchRoles = async () => {
            if (isOpen && availableRoles.length === 0) {
                setLoadingRoles(true);
                try {
                    const rolesData = await roleService.getAll();
                    setAvailableRoles(rolesData);
                } catch (err) {
                    console.error("Error cargando roles", err);
                } finally {
                    setLoadingRoles(false);
                }
            }
        };
        fetchRoles();
    }, [isOpen, availableRoles.length]);

    // --- INICIALIZACIÓN DEL FORMULARIO ---
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setPhotoFile(null);
            setIsSubmitting(false);

            if (userToEdit) {
                // Lógica de Normalización para Edición
                let fName = userToEdit.firstName || userToEdit.FirstName || "";
                let lName = userToEdit.lastName || userToEdit.LastName || "";

                // Foto
                let existingPhoto = "";
                const rawPhoto = userToEdit.photo || userToEdit.Photo;
                if (rawPhoto) {
                    if (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:')) {
                        existingPhoto = rawPhoto;
                    } else {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    }
                }

                // Rol
                let userRoleName = "";
                if (userToEdit.role) userRoleName = userToEdit.role;
                else if (userToEdit.roles && userToEdit.roles.length > 0) userRoleName = userToEdit.roles[0];
                
                const matchingRoleObj = availableRoles.find(r => (r.name || r.Name) === userRoleName);
                const roleIdToSelect = matchingRoleObj ? (matchingRoleObj.id || matchingRoleObj.Id) : "";

                setFormData({
                    firstName: fName,
                    lastName: lName,
                    email: userToEdit.email || userToEdit.Email || "",
                    password: '', // Password vacío en edición
                    role: roleIdToSelect,
                    isActive: userToEdit.isActive !== undefined ? userToEdit.isActive : true
                });
                setPhotoPreview(existingPhoto);

            } else {
                // Modo Creación (Reset)
                let defaultRole = availableRoles.length > 0 ? (availableRoles[0].id || availableRoles[0].Id) : "";
                setFormData({ ...initialFormState, role: defaultRole });
                setPhotoPreview(null);
            }
        }
    }, [isOpen, userToEdit, availableRoles]);

    // --- HANDLERS ---
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoFile(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Pasamos los datos procesados al padre (UserPage) que tiene la lógica de API
            await onSubmit({ ...formData, photoFile: photoFile });
            // El cierre del modal lo maneja el padre si tiene éxito, 
            // pero si falla, se queda aquí mostrando el error.
        } catch (err) {
            setError(err.message || "Error desconocido al guardar");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        handleChange,
        photoPreview,
        fileInputRef,
        triggerFileInput,
        handleFileChange,
        availableRoles,
        loadingRoles,
        isSubmitting,
        error,
        handleSubmit
    };
}