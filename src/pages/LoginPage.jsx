import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Loader2 } from 'lucide-react';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

function LoginPage({ logoUrl }) {
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login({ email, password }); 
            navigate('/'); 
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full">
            
            {/* --- SECCIÓN IZQUIERDA (BRANDING) --- */}
            <div className="hidden lg:flex w-1/2 bg-pink-600 items-center justify-center relative overflow-hidden">
                {/* Decoración de Fondo */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
                
                <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
                    
                    {/* --- LOGO 3D VOLUMÉTRICO --- */}
                    <div className="mb-10 relative group">
                        {/* 1. Capa de Brillo/Resplandor detrás */}
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl transform scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* 2. Contenedor "Glass" con profundidad */}
                        <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border-t border-l border-white/40 border-b border-r border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-transform duration-500 hover:scale-[1.02] flex flex-col items-center">
                            
                            {/* LOGO con Efecto de Volumen (Drop Shadow específico) */}
                            {logoUrl ? (
                                <img 
                                    src={logoUrl} 
                                    alt="Logo" 
                                    className="h-28 w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)] filter brightness-110 contrast-125" 
                                />
                            ) : (
                                <Store 
                                    size={100} 
                                    className="text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]" 
                                    strokeWidth={1.5} 
                                />
                            )}

                            {/* Reflejo superior (efecto cristal) */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none"></div>
                        </div>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight text-center drop-shadow-md">
                        ¡Hola de nuevo!
                    </h2>
                    <p className="text-pink-100 text-lg text-center leading-relaxed font-medium">
                        Tu sistema de punto de venta inteligente.
                    </p>
                </div>
            </div>

            {/* --- SECCIÓN DERECHA (FORMULARIO - Sin cambios estructurales) --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 lg:p-24">
                <div className="w-full max-w-md space-y-8">
                    {/* Header Móvil */}
                    <div className="lg:hidden text-center mb-8">
                         <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-pink-100">
                            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain"/> : <Store size={48} className="text-pink-500"/>}
                         </div>
                         <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
                    </div>

                    <div className="text-left hidden lg:block">
                        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">INICIAR SESIÓN</h3>
                        <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder al panel.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-gray-600 tracking-wide ml-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-2 px-5 py-4 border border-gray-200 rounded-xl text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-600 tracking-wide ml-1">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full mt-2 px-5 py-4 border border-gray-200 rounded-xl text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-sm font-bold text-pink-500 hover:text-pink-600 hover:underline transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg animate-in fade-in slide-in-from-top-2">
                                {getFriendlyErrorMessage(error)}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-pink-200 text-base font-bold text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin mr-2" size={24} /> Verificando...</>
                            ) : (
                                'Ingresar al Sistema'
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-medium">
                            &copy; {new Date().getFullYear()} ALBA POS System.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;