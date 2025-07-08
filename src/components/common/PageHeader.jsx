// src/components/common/PageHeader.jsx

// Se importa la librería React.
import React from 'react';

// Se define un componente funcional para el encabezado de página.
// Acepta 'title' (título principal) y 'children' (elementos extra, como botones) como props.
function PageHeader({ title, children }) {
    // El componente retorna la estructura JSX del encabezado.
    return (
        // Contenedor principal del encabezado, usa Flexbox para alinear elementos.
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            {/* Contenedor para el breadcrumb y el título. */}
            <div>
                {/* Breadcrumb que muestra la ruta de navegación. */}
                <p className="text-sm text-gray-500">Home / {title}</p>
                {/* Título principal de la página. */}
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            </div>
            {/* Contenedor para los elementos hijos (botones de acción). */}
            <div className="mt-4 sm:mt-0">
                {children}
            </div>
        </div>
    );
}

// Se exporta el componente para su uso en otras páginas.
export default PageHeader;