import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Context & Components
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileContent from '../components/profile/ProfileContent';

// Hooks (La lógica refactorizada)
import { useProfileForm } from '../hooks/profile/useProfileForm';
import { useProfileSecurity } from '../hooks/profile/useProfileSecurity';

function ProfilePage() {
    const { user, refreshUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');

    // 1. Hook de Información Personal
    const {
        formData,
        setFormData,
        photoPreview,
        handlePhotoChange,
        updateProfile,
        isLoading: isUpdatingProfile
    } = useProfileForm(user, refreshUser);

    // 2. Hook de Seguridad
    const {
        passData,
        setPassData,
        changeUserPassword,
        isLoading: isUpdatingPassword
    } = useProfileSecurity(user, logout);

    // Evitamos renderizar si no hay usuario cargado aún
    if (!user) return null;

    return (
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex-shrink-0">
                <PageHeader
                    title="Mi Perfil"
                    subtitle="Gestiona tu información personal y seguridad"
                    icon={User}
                />
            </div>

            {/* CONTENIDO */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* BARRA LATERAL (Foto y Navegación) */}
                    <ProfileSidebar
                        user={user} // Usamos user directo del contexto para mostrar datos inmutables
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onLogout={logout}
                        onPhotoChange={handlePhotoChange}
                        photoPreview={photoPreview} // La preview viene del hook del formulario
                    />

                    {/* CONTENIDO PRINCIPAL (Formularios) */}
                    <ProfileContent
                        activeTab={activeTab}
                        
                        // Datos Personales
                        formData={formData}
                        setFormData={setFormData}
                        onUpdateProfile={updateProfile}
                        
                        // Seguridad
                        passData={passData}
                        setPassData={setPassData}
                        onChangePassword={changeUserPassword}

                        // Loading unificado (visual)
                        isLoading={isUpdatingProfile || isUpdatingPassword}
                    />
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;