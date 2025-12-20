import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import { User } from 'lucide-react';
import { userService } from '../services/userService';
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
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // Cargar datos
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

    // Handlers
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoFile(file);
        }
    };

    const handleUpdateProfile = async (e) => {
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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (passData.newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        try {
            // TODO: Integrar endpoint de cambio de contraseña
            await new Promise(r => setTimeout(r, 1000));
            toast.success("Contraseña actualizada con éxito");
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message || "Error al cambiar contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        // --- FIX DE ESPACIADO ---
        // 1. max-w-7xl mx-auto: Centra el contenido y evita que se estire demasiado.
        // 2. p-6 lg:p-8: Agrega el "aire" (padding) arriba, abajo y a los lados. Esto soluciona lo marcado en rojo.
        <div className="max-w-7xl mx-auto w-full p-6 lg:p-8 animate-in fade-in duration-500">

            <PageHeader
                title="Mi Perfil"
                subtitle="Gestiona tu información personal y seguridad"
                icon={User}
            />

            {/* Contenedor Flex: Sidebar + Contenido */}
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
                    formData={formData}
                    setFormData={setFormData}
                    passData={passData}
                    setPassData={setPassData}
                    onUpdateProfile={handleUpdateProfile}
                    onChangePassword={handleChangePassword}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export default ProfilePage;