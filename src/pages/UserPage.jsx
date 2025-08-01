// src/pages/UsersPage.jsx

// Se importan los componentes necesarios.
import React from 'react';
import PageHeader from '../components/common/PageHeader';

// Se define el componente funcional para la página de Gestión de Usuarios.
function UsersPage() {
    // El componente retorna la estructura JSX de la página.
    return (
        // Contenedor principal con padding.
        <div className="p-8">
            {/* Se utiliza el componente reutilizable PageHeader. */}
            <PageHeader title="Usuarios" />

            {/* Contenido de marcador de posición para la página. */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <p className="text-gray-600">La funcionalidad para la gestión de usuarios se implementará aquí.</p>
            </div>
        </div>
    );
}

// Se exporta el componente.
export default UsersPage;