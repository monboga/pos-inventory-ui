import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { forgotPassword } from '../services/authService'; // Importación directa

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await forgotPassword(email);
            setStatus('success');
            setMsg(`Hemos enviado un código de recuperación a ${email}`);
        } catch (error) {
            setStatus('error');
            setMsg(error.message);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-white">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Send size={36} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Correo Enviado!</h2>
                    <p className="text-gray-500 mb-8">{msg}</p>
                    {/* Botón para ir al paso 2: Ingresar OTP */}
                    <Link to="/reset-password" 
                        className="block w-full py-4 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all shadow-lg shadow-pink-200">
                        Tengo mi código (OTP)
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-white">
                <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-pink-500 mb-8 transition-colors font-medium text-sm">
                    <ArrowLeft size={18} className="mr-2" /> Regresar al Login
                </Link>

                <h2 className="text-3xl font-bold text-gray-800 mb-3">Recuperar Cuenta</h2>
                <p className="text-gray-500 mb-8">Ingresa tu correo asociado y te enviaremos un código de seguridad.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-medium"
                                placeholder="tu@correo.com"
                            />
                        </div>
                    </div>

                    {status === 'error' && <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl text-center">{msg}</div>}

                    <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all disabled:opacity-70">
                        {status === 'loading' ? 'Enviando Código...' : 'Enviar Código'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;