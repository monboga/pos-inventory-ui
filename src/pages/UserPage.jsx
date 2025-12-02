// src/pages/UsersPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext'; // Importamos el hook de autenticación

function UsersPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // Función para cerrar sesión y redirigir
    const handleLogout = () => {
        logout(); 
        navigate('/login');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                {/* Se utiliza el componente reutilizable PageHeader. */}
                <PageHeader title="Usuarios" />
                
                {/* Botón de Cerrar Sesión */}
                 <button 
                    onClick={handleLogout} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-150"
                 >
                    Cerrar Sesión
                 </button>
            </div>

            {/* Contenedor principal estilo tarjeta */}
            <div className="bg-white p-6 rounded-2xl shadow-md min-h-[400px]">
                
                {/* 3. Manejo de Estados de la UI */}
                
                {/* ESTADO: CARGANDO */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-2 text-gray-500">Cargando usuarios...</span>
                    </div>
                )}

                {/* ESTADO: ERROR */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Error al cargar datos: {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ESTADO: ÉXITO (Mostramos la tabla) */}
                {!loading && !error && users.length > 0 && (
                    <UsersTable users={users} />
                )}

                {/* ESTADO: VACÍO */}
                {!loading && !error && users.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">No hay usuarios registrados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UsersPage;