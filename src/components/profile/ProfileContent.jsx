import React from 'react';
import { Mail, Lock, Key, Save, Shield } from 'lucide-react';

// Input Interno estilizado
const ProfileInput = ({ label, value, onChange, type = "text", disabled = false, icon: Icon, placeholder }) => (
    <div className="space-y-1.5 w-full">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="relative">
            {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all 
                ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white placeholder:text-gray-300 hover:border-gray-300'}`}
            />
        </div>
    </div>
);

function ProfileContent({ activeTab, formData, setFormData, passData, setPassData, onUpdateProfile, onChangePassword, isLoading }) {
    return (
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px] transition-all hover:shadow-md">

            {/* --- TAB: INFORMACIÓN PERSONAL --- */}
            {activeTab === 'personal' && (
                <form onSubmit={onUpdateProfile} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
                        <p className="text-sm text-gray-400 mt-1">Actualiza tus datos básicos y de contacto.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileInput
                            label="Nombre"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <ProfileInput
                            label="Apellido"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <ProfileInput
                        label="Correo Electrónico"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={Mail}
                    />

                    {/* Banner Informativo */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Shield className="text-blue-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-blue-800">Cuenta Verificada</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                Tu rol actual es <strong>{formData.role}</strong>. Estos permisos son administrados por el sistema.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>
            )}

            {/* --- TAB: SEGURIDAD --- */}
            {activeTab === 'security' && (
                <form onSubmit={onChangePassword} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Login & Password</h3>
                        <p className="text-sm text-gray-400 mt-1">Gestiona tu contraseña para mantener tu cuenta segura.</p>
                    </div>

                    <div className="max-w-xl space-y-6">
                        <ProfileInput
                            label="Contraseña Actual"
                            type="password"
                            placeholder="Ingrese su contraseña actual"
                            value={passData.currentPassword}
                            onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                            icon={Lock}
                        />

                        <div className="h-px bg-gray-100 my-2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileInput
                                label="Nueva Contraseña"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={passData.newPassword}
                                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                icon={Key}
                            />

                            <ProfileInput
                                label="Confirmar Nueva"
                                type="password"
                                placeholder="Repita la contraseña"
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                icon={Key}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        {/* FIX: Botón ahora es Rosa (ALBA Brand) */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Actualizando...' : <><Save size={18} /> Actualizar Contraseña</>}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ProfileContent;