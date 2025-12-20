import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Lock, AlertCircle } from 'lucide-react';
import PageTransition from '../components/common/PageTransition'; // <--- IMPORTANTE

function LoginPage() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError(''); // Limpiar error al escribir
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(credentials);
            navigate('/dashboard');
        } catch (err) {
            // Manejo de error limpio
            const msg = err.message || "Error al iniciar sesión";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Envolvemos TODO el contenido visual en PageTransition
        <PageTransition className="flex h-screen w-full bg-gray-50">

            {/* IZQUIERDA: Banner / Marca */}
            <div className="hidden lg:flex w-1/2 bg-pink-500 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-pink-400 opacity-90" />
                <div className="relative z-10 text-center text-white p-10">
                    <div className="bg-white/20 backdrop-blur-lg p-6 rounded-3xl inline-block mb-6 shadow-xl">
                        <Store size={64} />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">¡Hola de nuevo!</h1>
                    <p className="text-pink-100 text-lg max-w-md mx-auto">
                        Tu sistema de punto de venta inteligente, diseñado para hacer crecer tu negocio.
                    </p>
                </div>
                {/* Elementos decorativos animados (opcional) */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
            </div>

            {/* DERECHA: Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">INICIAR SESIÓN</h2>
                        <p className="mt-2 text-gray-500">Ingresa tus credenciales para acceder al panel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <span className="text-sm text-red-700 font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 bg-gray-50 focus:bg-white"
                                        placeholder="ejemplo@correo.com"
                                        value={credentials.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-pink-200 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Ingresando...' : 'Ingresar al Sistema'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        © {new Date().getFullYear()} ALBA POS System.
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}

export default LoginPage;