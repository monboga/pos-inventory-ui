import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext'; // Contexto actualizado
import { User, Mail, Shield, Edit } from 'lucide-react';
import UserModal from '../components/users/UserModal';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

function ProfilePage() {
    // 1. Usamos refreshUser en lugar de updateUser
    const { user, refreshUser } = useAuth(); 
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUpdateProfile = async (formData) => {
        const toastId = toast.loading("Actualizando perfil...");
        try {
            // 2. Actualizar en Backend (Enviamos IDs, formdata, etc.)
            await userService.update(user.id, formData);
            
            // 3. Recargar datos del usuario desde el Backend
            // Esto traerá la foto con la URL correcta y el nombre del rol
            await refreshUser(); 
            
            toast.success("Perfil actualizado correctamente", { id: toastId });
            setIsModalOpen(false);

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar perfil", { id: toastId });
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <PageHeader title="Mi Perfil" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-32 relative"></div>
                
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row justify-between items-end gap-4">
                        <div className="flex items-end">
                            {/* Avatar */}
                            {user?.photo ? (
                                <img 
                                    src={user.photo} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" 
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-4xl font-bold text-pink-600 bg-pink-100 select-none">
                                    {user?.initials || "U"}
                                </div>
                            )}
                            
                            <div className="ml-4 mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                                {/* Aquí ahora se mostrará el NOMBRE del rol gracias a refreshUser */}
                                <p className="text-gray-500 capitalize font-medium">{user?.role}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Edit size={18} /> Editar Información
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Información Personal</h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 font-medium">
                                    <User size={18} className="text-gray-400 mr-3" />
                                    {user?.name || "No disponible"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre</label>
                                    <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm">
                                        {user?.firstName || "-"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Apellido</label>
                                    <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm">
                                        {user?.lastName || "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Detalles de Cuenta</h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 font-medium">
                                    <Mail size={18} className="text-gray-400 mr-3" />
                                    {user?.email}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol del Sistema</label>
                                <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 font-bold">
                                    <Shield size={18} className="text-blue-500 mr-3" />
                                    {/* Muestra el Rol (Nombre) */}
                                    <span className="capitalize">{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleUpdateProfile} 
                userToEdit={user} 
            />
        </div>
    );
}

export default ProfilePage;