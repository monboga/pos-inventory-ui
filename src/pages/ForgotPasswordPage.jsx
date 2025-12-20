import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/authService';
import PageTransition from '../components/common/PageTransition'; // <--- IMPORTAR

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        // ... (tu lógica existente se queda igual) ...
        e.preventDefault();
        setStatus('loading');
        try {
            await forgotPassword(email);
            setStatus('success');
            setMsg(`Hemos enviado las instrucciones a ${email}`);
        } catch (error) {
            setStatus('error');
            setMsg(error.message);
        }
    };

    return (
        // Envolvemos TODO el return en PageTransition
        <PageTransition className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                {status === 'success' ? (
                    // ... (tu código de éxito existente) ...
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Revisa tu correo</h2>
                        <p className="text-gray-500 mb-6">{msg}</p>
                        <Link to="/reset-password"
                            className="block w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-colors text-center">
                            Tengo el código (OTP)
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-gray-600 mb-6 font-medium text-sm transition-colors">
                            <ArrowLeft size={16} className="mr-2" /> Volver al Login
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Contraseña</h2>
                        <p className="text-gray-500 mb-8 text-sm">No te preocupes. Ingresa tu correo y te ayudaremos.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... (tus inputs y botones existentes) ... */}
                            <div>
                                <label className="text-sm font-bold text-gray-700">Correo Electrónico</label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            {status === 'error' && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg text-center">{msg}</div>}

                            <button type="submit" disabled={status === 'loading'} className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all shadow-md shadow-pink-200 disabled:opacity-70">
                                {status === 'loading' ? 'Enviando...' : 'Enviar Instrucciones'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </PageTransition>
    );
}

export default ForgotPasswordPage;