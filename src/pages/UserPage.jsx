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

            {/* Contenido de marcador de posición para la página. */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <p className="text-gray-600">La funcionalidad para la gestión de usuarios se implementará aquí.</p>
            </div>
        </div>
    );
}

export default UsersPage;