import React from 'react';

function PageHeader({ title, children }) {
    return (
        // 1. Contenedor Full Width (Barra Superior)
        // bg-white: Fondo del header (cámbialo si tu sidebar tiene otro color)
        // border-b: Línea sutil de separación
        // px-6 md:px-8: Padding lateral interno para alinear con el contenido
        // py-4: Altura cómoda
        <div className="w-full bg-white border-b border-gray-100 px-6 md:px-8 py-4 sticky top-0 z-20 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            
            {/* Sección Título y Breadcrumb */}
            <div>
                {/* Breadcrumb minimalista */}
                <nav className="text-[10px] md:text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide flex items-center gap-1">
                    <span className="hover:text-pink-500 cursor-pointer transition-colors">Home</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-600">{title}</span>
                </nav>
                
                {/* Título Principal */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                    {title}
                </h1>
            </div>

            {/* Acciones / Botones (Children) */}
            {/* Si hay contenido extra (botones), se muestra aquí */}
            {children && (
                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}

export default PageHeader;