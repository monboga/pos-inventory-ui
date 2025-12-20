import React from 'react';
import { Camera, User, Key, LogOut, Shield } from 'lucide-react';

function ProfileSidebar({ user, activeTab, setActiveTab, onLogout, onPhotoChange, photoPreview }) {
    return (
        <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center h-full transition-all hover:shadow-md">

                {/* Avatar */}
                <div className="relative mb-4 group">
                    <div className="w-32 h-32 rounded-full p-1.5 border-2 border-dashed border-pink-200 group-hover:border-pink-400 transition-colors">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Perfil" className="w-full h-full rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-pink-50 flex items-center justify-center text-pink-500 text-3xl font-bold">
                                {user.initials}
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-lg border border-gray-100 cursor-pointer hover:bg-pink-50 text-gray-500 hover:text-pink-500 transition-all active:scale-95">
                        <Camera size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={onPhotoChange} />
                    </label>
                </div>

                <h2 className="text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide border border-gray-200">
                    <Shield size={12} />
                    {user.role}
                </span>

                {/* Navegación Vertical */}
                <div className="w-full mt-8 space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'personal'
                                ? 'bg-pink-50 text-pink-600 shadow-sm ring-1 ring-pink-200'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <User size={18} />
                        Información Personal
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'security'
                                ? 'bg-pink-50 text-pink-600 shadow-sm ring-1 ring-pink-200'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <Key size={18} />
                        Inicio de Sesión y Contraseña
                    </button>
                </div>

                <div className="w-full pt-4 mt-4 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm hover:shadow-sm"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileSidebar;