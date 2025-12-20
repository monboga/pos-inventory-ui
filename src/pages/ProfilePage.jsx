import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import { User } from 'lucide-react';
import { userService } from '../services/userService';
// 1. IMPORTAMOS EL NUEVO SERVICIO
import { changePassword } from '../services/authService';
import toast from 'react-hot-toast';

// Importamos los sub-componentes
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileContent from '../components/profile/ProfileContent';

function ProfilePage() {
    const { user, refreshUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);

    // Estados
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: '' });

    // Estado para contraseñas
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.role || 'Usuario'
            });
            setPhotoPreview(user.photo);
        }
    }, [user]);

    // Handler Foto
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoFile(file);
        }
    };

    // Handler Actualizar Perfil (Info Personal)
    const handleUpdateProfile = async (e) => {
        // ... (tu lógica existente de update profile se mantiene igual)
        e.preventDefault();
        setIsLoading(true);
        try {
            const dataToUpdate = {
                ...formData,
                isActive: true,
                photoFile: photoFile,
                role: user.role
            };
            await userService.update(user.id, dataToUpdate);
            await refreshUser();
            toast.success("Perfil actualizado correctamente");
            setPhotoFile(null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar perfil");
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLER CAMBIO DE CONTRASEÑA (NUEVO) ---
    const handleChangePassword = async (e) => {
        e.preventDefault();

        // 1. Validaciones de UI previas
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }

        // 2. Nota: Aunque el backend valida complejidad, validamos longitud básica aquí
        // para ahorrar una llamada si es muy obvio.
        if (passData.newPassword.length < 12) {
            toast.error("La contraseña debe tener al menos 12 caracteres (Regla del Sistema)");
            return;
        }

        setIsLoading(true);
        try {
            // 3. Llamada al Backend
            // Nota: Tu endpoint actual NO valida la 'currentPassword', solo la 'newPassword'.
            // Enviamos solo la nueva.
            await changePassword(passData.newPassword);

            toast.success("Contraseña actualizada con éxito");

            // 4. Limpiamos el formulario
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error) {
            // 5. Manejo de errores del Backend (ej. "La contraseña debe tener mayúsculas")
            console.error(error);
            // El servicio ya nos devuelve el mensaje limpio en error.message
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto w-full p-6 lg:p-8 animate-in fade-in duration-500">

            <PageHeader
                title="Mi Perfil"
                subtitle="Gestiona tu información personal y seguridad"
                icon={User}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                <ProfileSidebar
                    user={user}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={logout}
                    onPhotoChange={handlePhotoChange}
                    photoPreview={photoPreview}
                />

                <ProfileContent
                    activeTab={activeTab}

                    // Props Info Personal
                    formData={formData}
                    setFormData={setFormData}
                    onUpdateProfile={handleUpdateProfile}

                    // Props Seguridad
                    passData={passData}
                    setPassData={setPassData}
                    onChangePassword={handleChangePassword} // <--- Conectado aquí

                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export default ProfilePage;