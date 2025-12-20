import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle, Mail } from 'lucide-react';
import { resetPassword } from '../services/authService';
import PageTransition from '../components/common/PageTransition'; // <--- IMPORTAR

function ResetPasswordPage() {
    const navigate = useNavigate();
    // Mantenemos 'token' en el estado local porque es semántico para el input visual
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
            // --- FIX DE MAPEO AQUÍ ---
            // La API espera: { email, otp, newPassword }
            await resetPassword({
                email: formData.email,
                otp: formData.token, // <--- CAMBIO IMPORTANTE: Mapeamos 'token' a 'otp'
                newPassword: formData.newPassword
            });

            setStatus('success');
            setTimeout(() => navigate('/login'), 3500);
        } catch (err) {
            setStatus('error');
            // Mostramos el mensaje limpio si viene del backend
            setError(err.message);
        }
    };

    if (status === 'success') {
        return (
            <PageTransition className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Éxito!</h2>
                    <p className="text-gray-500 mt-2">Contraseña actualizada correctamente. Redirigiendo...</p>
                </div>
            </PageTransition >
        );
    }

    return (
        <PageTransition className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Nueva Contraseña</h2>
                <p className="text-gray-500 text-sm text-center mb-8">Ingresa el código OTP que recibiste por correo.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input Correo */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Correo</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input name="email" type="email" required onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-pink-500 outline-none" placeholder="Confirma tu correo" />
                        </div>
                    </div>
                    {/* Input OTP (Mapeado internamente a 'token') */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Código OTP</label>
                        <div className="relative mt-1">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input name="token" type="text" required onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-pink-500 outline-none font-mono tracking-widest" placeholder="XXXXXX" />
                        </div>
                    </div>
                    {/* Nueva Contraseña */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Nueva Contraseña</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input name="newPassword" type="password" required onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-pink-500 outline-none" placeholder="Nueva clave" />
                        </div>
                    </div>
                    {/* Confirmar Contraseña */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Confirmar</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input name="confirmPassword" type="password" required onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-pink-500 outline-none" placeholder="Repite clave" />
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded text-center">{error}</div>}
                    <button type="submit" disabled={status === 'loading'} className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all shadow-md">
                        {status === 'loading' ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </PageTransition >
    );
}

export default ResetPasswordPage;