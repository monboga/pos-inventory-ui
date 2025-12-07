import React from 'react';

/**
 * Tarjeta de Resumen (KPI) Reutilizable
 * @param {string} title - Título pequeño (ej. "Ventas de Hoy")
 * @param {string|number} value - Valor principal (ej. "$1,500.00")
 * @param {string} subtitle - Texto pequeño inferior (ej. "+12% vs ayer")
 * @param {element} icon - Icono de Lucide
 * @param {string} colorClass - Clases de color (ej. "bg-pink-100 text-pink-600")
 */
function SummaryCard({ title, value, subtitle, icon: Icon, colorClass }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all hover:shadow-md">
            <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

export default SummaryCard;