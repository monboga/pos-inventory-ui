import React, { useState, useEffect } from 'react';
import { Mail, Lock, Key, Save, Shield, Eye, EyeOff, Check, X as XIcon, Edit2, XCircle } from 'lucide-react';

// --- COMPONENTE INPUT (Con soporte visual de disabled) ---
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
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-2.5 border rounded-xl outline-none transition-all 
                    ${disabled
                            ? 'bg-gray-50 text-gray-500 border-gray-100 cursor-default' // Estilo Bloqueado (Limpio)
                            : 'bg-white border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500' // Estilo Edición
                        }`}
                />

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

// --- COMPONENTE REQUISITOS PASSWORD ---
const PasswordRequirements = ({ password }) => {
    const requirements = [
        { id: 1, text: "Mínimo 12 caracteres", valid: password.length >= 12 },
        { id: 2, text: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
        { id: 3, text: "Al menos un número", valid: /[0-9]/.test(password) },
        { id: 4, text: "Al menos un carácter especial (!@#$)", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
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

    // Estados locales para controlar el Modo Edición
    const [isEditing, setIsEditing] = useState(false);
    const [snapshotData, setSnapshotData] = useState({}); // Para guardar backup y comparar cambios

    // Detectamos cambios comparando el estado actual con el snapshot
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(snapshotData);

    // Al montar o cambiar de pestaña, aseguramos que no estamos editando
    useEffect(() => {
        setIsEditing(false);
    }, [activeTab]);

    // HANDLERS DEL MODO EDICIÓN
    const handleStartEditing = () => {
        setSnapshotData({ ...formData }); // Guardamos copia de seguridad
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setFormData(snapshotData); // Revertimos cambios
        setIsEditing(false);
    };

    const handleSaveWrapper = async (e) => {
        await onUpdateProfile(e);
        // Si todo salió bien (y el padre no lanzó error), salimos del modo edición
        // Nota: Idealmente onUpdateProfile debería devolver true/false, pero asumimos éxito si no hay catch global aquí
        setIsEditing(false);
    };

    // Validación de Password
    const isPasswordValid = () => {
        const pwd = passData.newPassword;
        return pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    };

    return (
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px] w-full transition-all hover:shadow-md relative">

            {/* --- TAB: INFORMACIÓN PERSONAL --- */}
            {activeTab === 'personal' && (
                <form onSubmit={handleSaveWrapper} className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                    {/* Encabezado con Botón de Editar */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
                            <p className="text-sm text-gray-400 mt-1">Actualiza tus datos básicos y de contacto.</p>
                        </div>

                        {!isEditing && (
                            <button
                                type="button"
                                onClick={handleStartEditing}
                                className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors font-medium text-sm active:scale-95"
                            >
                                <Edit2 size={16} />
                                Editar
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileInput
                            label="Nombre"
                            value={formData.firstName}
                            disabled={!isEditing} // Protegido
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <ProfileInput
                            label="Apellido"
                            value={formData.lastName}
                            disabled={!isEditing} // Protegido
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <ProfileInput
                        label="Correo Electrónico"
                        type="email"
                        value={formData.email}
                        disabled={!isEditing} // Protegido
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={Mail}
                    />

                    {/* Banner Informativo (Visible siempre) */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Shield className="text-blue-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-blue-800">Cuenta Verificada</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                Tu rol actual es <strong>{formData.role}</strong>. Estos permisos son administrados por el sistema.
                            </p>
                        </div>
                    </div>

                    {/* Footer de Acciones (Solo visible en Edición) */}
                    {isEditing && (
                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-2">
                            <button
                                type="button"
                                onClick={handleCancelEditing}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                            >
                                <XCircle size={18} />
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                // Bloqueado si cargando O si NO hay cambios
                                disabled={isLoading || !hasChanges}
                                className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                            >
                                {isLoading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                            </button>
                        </div>
                    )}
                </form>
            )}

            {/* --- TAB: SEGURIDAD (Sin cambios mayores, solo visuales) --- */}
            {activeTab === 'security' && (
                <form onSubmit={onChangePassword} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Inicio de Sesión y Contraseña</h3>
                        <p className="text-sm text-gray-400 mt-1">Gestiona tu contraseña para mantener tu cuenta segura.</p>
                    </div>

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

                        <PasswordRequirements password={passData.newPassword} />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
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