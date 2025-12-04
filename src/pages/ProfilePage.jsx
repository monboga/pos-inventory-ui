// src/pages/ProfilePage.jsx

import React from 'react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <PageHeader title="Mi Perfil" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                {/* Fondo decorativo */}
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-32 relative"></div>
                
                <div className="px-8 pb-8">
                    {/* Sección del Avatar Superpuesto */}
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="flex items-end">
                            {/* LÓGICA DE AVATAR GRANDE */}
                            {user?.photo ? (
                                <img 
                                    src={user.photo} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" 
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-4xl font-bold text-pink-600 bg-pink-100">
                                    {user?.initials || "U"}
                                </div>
                            )}
                            
                            <div className="ml-4 mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                                <p className="text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        
                        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors shadow-sm">
                            Editar Información
                        </button>
                    </div>

                    {/* Grid de Información */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* Columna Izquierda: Info Personal */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Información Personal</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre Completo</label>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                                    <User size={18} className="text-gray-400 mr-3" />
                                    {user?.name || "No disponible"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                                        {user?.firstName || "-"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Apellido</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                                        {user?.lastName || "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Detalles de Cuenta */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Detalles de Cuenta</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Correo Electrónico</label>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                                    <Mail size={18} className="text-gray-400 mr-3" />
                                    {user?.email}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Rol del Sistema</label>
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 font-medium">
                                    <Shield size={18} className="text-blue-500 mr-3" />
                                    <span className="capitalize">{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;