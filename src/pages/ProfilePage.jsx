import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import { User } from 'lucide-react';
import { userService } from '../services/userService';
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
                role: user.roles?.[0] || 'Usuario'
            });
            setPhotoPreview(user.photoUrl);
        }
    }, [user]);

    // --- HANDLERS ---
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const loadId = toast.loading("Actualizando perfil...");

        try {
            const data = new FormData();
            data.append('FirstName', formData.firstName);
            data.append('LastName', formData.lastName);
            data.append('Email', formData.email);
            if (photoFile) {
                data.append('Photo', photoFile);
            }

            await userService.updateProfile(user.id, data);
            
            await refreshUser();
            toast.success("Perfil actualizado correctamente", { id: loadId });
            setPhotoFile(null);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar perfil", { id: loadId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(user.email, passData.currentPassword, passData.newPassword);
            toast.success("Contraseña actualizada. Por favor inicia sesión nuevamente.");
            logout(); 
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        // 1. WRAPPER PRINCIPAL (Estructura Full Width estándar)
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">

            {/* 2. PAGE HEADER (Ocupa todo el ancho superior) */}
            <div className="flex-shrink-0">
                <PageHeader
                    title="Mi Perfil"
                    subtitle="Gestiona tu información personal y seguridad"
                    icon={User}
                />
            </div>

            {/* 3. CONTENIDO PRINCIPAL (Centrado y limitado a 7xl) */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8 animate-in fade-in duration-500">
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
        </div>
    );
}

export default ProfilePage;