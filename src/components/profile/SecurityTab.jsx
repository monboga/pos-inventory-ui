import React from 'react';
import { Lock, Key, Save } from 'lucide-react';
import ProfileInput from '../common/ProfileInput';
import PasswordRequirements from './PasswordRequirements';

function SecurityTab({ passData, setPassData, onChangePassword, isLoading }) {
    
    // Validación local simple para habilitar botón
    const isPasswordValid = () => {
        const pwd = passData.newPassword;
        return pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    };

    return (
        <form onSubmit={onChangePassword} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Inicio de Sesión y Contraseña</h3>
                <p className="text-sm text-gray-400 mt-1">Gestiona tu contraseña para mantener tu cuenta segura.</p>
            </div>

            <div className="space-y-6">
                <ProfileInput label="Contraseña Actual" isPassword={true} placeholder="Ingrese su contraseña actual" value={passData.currentPassword} onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })} icon={Lock} />
                
                <div className="h-px bg-gray-100 my-2"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileInput label="Nueva Contraseña" isPassword={true} placeholder="Crea una contraseña fuerte" value={passData.newPassword} onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })} icon={Key} />
                    <ProfileInput label="Confirmar Nueva" isPassword={true} placeholder="Repita la contraseña" value={passData.confirmPassword} onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })} icon={Key} />
                </div>

                <PasswordRequirements password={passData.newPassword} />
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isLoading || !isPasswordValid()} className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Actualizando...' : <><Save size={18} /> Actualizar Contraseña</>}
                </button>
            </div>
        </form>
    );
}

export default SecurityTab;