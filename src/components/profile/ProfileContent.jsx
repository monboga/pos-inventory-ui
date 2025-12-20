import React, { useState, useEffect } from 'react';
import { Mail, Lock, Key, Save, Shield, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';

// --- COMPONENTE INTERNO DE INPUT (Con Toggle Password) ---
const ProfileInput = ({ label, value, onChange, type = "text", disabled = false, icon: Icon, placeholder, isPassword = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="space-y-1.5 w-full">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <div className="relative">
                {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}

                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none transition-all 
                    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white placeholder:text-gray-300 hover:border-gray-300'}`}
                />

                {/* Botón de Ojo para Contraseñas */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE DE REQUISITOS DE CONTRASEÑA ---
const PasswordRequirements = ({ password }) => {
    const requirements = [
        { id: 1, text: "Mínimo 12 caracteres", valid: password.length >= 12 },
        { id: 2, text: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
        { id: 3, text: "Al menos un número", valid: /[0-9]/.test(password) },
        { id: 4, text: "Al menos un carácter especial (!@#$)", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Requisitos de seguridad</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {requirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-2 text-sm transition-colors duration-300">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${req.valid ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                            }`}>
                            {req.valid ? <Check size={12} strokeWidth={3} /> : <XIcon size={12} />}
                        </div>
                        <span className={req.valid ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                            {req.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

function ProfileContent({ activeTab, formData, setFormData, passData, setPassData, onUpdateProfile, onChangePassword, isLoading }) {

    // Validar si la contraseña cumple todos los requisitos antes de habilitar el botón
    const isPasswordValid = () => {
        const pwd = passData.newPassword;
        return pwd.length >= 12 &&
            /[A-Z]/.test(pwd) &&
            /[0-9]/.test(pwd) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    };

    return (
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px] w-full transition-all hover:shadow-md">

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
                        <h3 className="text-xl font-bold text-gray-800">Inicio de Sesión y Contraseña</h3>
                        <p className="text-sm text-gray-400 mt-1">Gestiona tu contraseña para mantener tu cuenta segura.</p>
                    </div>

                    {/* FIX LAYOUT: Quitamos 'max-w-xl' para que use todo el ancho */}
                    <div className="space-y-6">

                        <ProfileInput
                            label="Contraseña Actual"
                            isPassword={true}
                            placeholder="Ingrese su contraseña actual"
                            value={passData.currentPassword}
                            onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                            icon={Lock}
                        />

                        <div className="h-px bg-gray-100 my-2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileInput
                                label="Nueva Contraseña"
                                isPassword={true}
                                placeholder="Crea una contraseña fuerte"
                                value={passData.newPassword}
                                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                icon={Key}
                            />

                            <ProfileInput
                                label="Confirmar Nueva"
                                isPassword={true}
                                placeholder="Repita la contraseña"
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                icon={Key}
                            />
                        </div>

                        {/* Visualizador de Requisitos en Tiempo Real */}
                        <PasswordRequirements password={passData.newPassword} />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            // Deshabilitamos si está cargando O si no cumple los requisitos de seguridad
                            disabled={isLoading || !isPasswordValid()}
                            className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
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