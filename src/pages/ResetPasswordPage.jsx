import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle, Mail } from 'lucide-react';
import { resetPassword } from '../services/authService';

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setStatus('loading');
        try {
            // Enviamos al endpoint los 3 datos clave
            await resetPassword({
                email: formData.email,
                token: formData.token, // Este es el OTP recibido
                newPassword: formData.newPassword
            });
            setStatus('success');
            setTimeout(() => navigate('/login'), 3500); // Redirección automática
        } catch (err) {
            setStatus('error');
            setError(err.message);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-white">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Contraseña Actualizada!</h2>
                    <p className="text-gray-500 mb-6">Tu acceso ha sido restaurado correctamente.</p>
                    <div className="text-sm text-gray-400">Redirigiendo al login...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-white">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Restablecer Contraseña</h2>
                <p className="text-gray-500 text-center text-sm mb-8">Ingresa el código que recibiste y tu nueva contraseña.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirma tu Correo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input name="email" type="email" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="tu@correo.com" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Código OTP</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input name="token" type="text" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none tracking-widest font-mono" placeholder="XXXXXX" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-4 pt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nueva Contraseña</label>
                        <div className="relative mb-3">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input name="newPassword" type="password" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Nueva clave" onChange={handleChange} />
                        </div>

                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input name="confirmPassword" type="password" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Repite nueva clave" onChange={handleChange} />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl text-center">{error}</div>}

                    <button type="submit" disabled={status === 'loading'} className="w-full py-3.5 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all">
                        {status === 'loading' ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordPage;