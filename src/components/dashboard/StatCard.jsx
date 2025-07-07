// Se importa la librería React.
import React from 'react';

// --- Componente para una Tarjeta de Estadísticas ---
// Acepta props para el ícono, título, valor y un cambio porcentual opcional.
function StatCard({ icon, title, value, change }) {
    // El componente retorna la estructura JSX de la tarjeta.
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            {/* Contenedor para el ícono y el título. */}
            <div className="flex items-center justify-between mb-4">
                {/* Título de la tarjeta. */}
                <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
                {/* Contenedor del ícono con fondo rosa. */}
                <div className="bg-pink-100 p-2 rounded-lg">
                    {icon}
                </div>
            </div>
            {/* Contenedor para el valor principal y el cambio porcentual. */}
            <div>
                {/* Valor numérico principal, con fuente grande y en negrita. */}
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                {/* Cambio porcentual, con color verde para indicar crecimiento. */}
                <p className="text-green-500 text-sm mt-1">{change}</p>
            </div>
        </div>
    );
}

// Se exporta el componente para su uso en otros archivos.
export default StatCard;