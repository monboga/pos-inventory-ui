// src/pages/LoginPage.jsx

// Se importan los hooks de React y de las librerías.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Se define el componente funcional de la página de inicio de sesión.
function LoginPage({ logoUrl }) {
    // Se utiliza el hook 'useNavigate' para poder redirigir al usuario.
    const navigate = useNavigate();
    // Se obtiene la función 'login' de nuestro contexto de autenticación.
    const { login } = useAuth();

    // Se crean estados locales para los campos del formulario.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Función que se ejecuta al enviar el formulario.
    const handleSubmit = (event) => {
        // Se previene el comportamiento por defecto del formulario (recargar la página).
        event.preventDefault();
        // Se limpia cualquier error previo.
        setError('');

        // Se llama a la función 'login' del contexto con las credenciales ingresadas.
        const loginSuccessful = login(email, password);

        // Si el inicio de sesión es exitoso...
        if (loginSuccessful) {
            // ...se redirige al usuario a la página principal del dashboard.
            navigate('/');
        } else {
            // Si no, se muestra un mensaje de error.
            setError('Credenciales inválidas. Intente de nuevo.');
        }
    };

    // El componente retorna la estructura JSX.
    return (
        <div className="flex items-center justify-center min-h-screen bg-pink-50">
            {/* Contenedor principal de la tarjeta de inicio de sesión. */}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                {/* Contenedor del logo. */}
                <div className="flex justify-center">
                    <img src={logoUrl} alt="Logo del Negocio" className="w-32" />
                </div>
                {/* Encabezado de la tarjeta. */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Bienvenido de Vuelta</h2>
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
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
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
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    {/* Se muestra un mensaje de error si existe. */}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {/* Botón para enviar el formulario. */}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Se exporta el componente.
export default LoginPage;