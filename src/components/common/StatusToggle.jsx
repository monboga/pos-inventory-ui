import React from 'react';

const StatusToggle = ({ 
    isActive, 
    onToggle, 
    label = "Estado Activo", 
    description = "Habilitar o deshabilitar registro" 
}) => {
    return (
        <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group"
            onClick={onToggle}
        >
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {label}
                </span>
                {description && (
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors">
                        {description}
                    </span>
                )}
            </div>
            
            {/* Switch CSS Puro (Sin Iconos) - Estilo DiscountModal */}
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
        </div>
    );
};

export default StatusToggle;