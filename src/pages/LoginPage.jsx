// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage({ logoUrl }) {
    const navigate = useNavigate();
    // Obtenemos la función login (asíncrona) de nuestro contexto
    const { login } = useAuth(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado para deshabilitar el botón

    // Función que se ejecuta al enviar el formulario (AHORA ASÍNCRONA)
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // La función login ahora es asíncrona y lanza errores si falla la API
            await login(email, password); 
            // Si es exitoso, redirige a /usuarios
            navigate('/usuarios'); 
        } catch (err) {
            // Captura el error lanzado por AuthContext o authService
            setError(err.message || 'Error de conexión. Intente de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estilos clave para replicar el diseño ALBA
    const PRIMARY_COLOR = 'bg-pink-500 hover:bg-pink-600'; 
    const INPUT_BG = 'bg-blue-50'; // Color de fondo de los inputs en el diseño

    return (
        // Fondo Rosa pálido
        <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4">
            {/* Contenedor principal de la tarjeta. */}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-xl">
                {/* Contenedor del logo ALBA (Texto simulado del logo) */}
                 <div className="flex justify-center">
                    <img src={logoUrl} alt="Logo del Negocio" className="w-32" />
                </div>
                <div className="text-center">
                    
                    <h3 className="text-lg font-semibold mt-4 text-gray-800">Bienvenido de Vuelta</h3>
                    <p className="mt-2 text-sm text-gray-500">Ingresa tus credenciales para acceder a tu cuenta.</p>
                </div>

                {/* Formulario de inicio de sesión. */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Campo para el correo electrónico. */}
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // Input con fondo y borde más suave
                            className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm ${INPUT_BG} 
                                        focus:ring-pink-500 focus:border-pink-500`}
                        />
                    </div>
                    {/* Campo para la contraseña. */}
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // Input con fondo y borde más suave
                            className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm ${INPUT_BG} 
                                        focus:ring-pink-500 focus:border-pink-500`}
                        />
                    </div>
                    {/* Se muestra un mensaje de error si existe. */}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {/* Botón para enviar el formulario. */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting} // Deshabilita durante la petición
                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm 
                                        text-sm font-medium text-white ${PRIMARY_COLOR} focus:outline-none focus:ring-2 
                                        focus:ring-offset-2 focus:ring-pink-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;