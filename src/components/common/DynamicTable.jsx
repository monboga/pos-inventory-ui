import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de Tabla Reutilizable
 * @param {Array} columns - Configuración de columnas [{ header: "Nombre", render: (row) => ... }]
 * @param {Array} data - Los datos a mostrar
 * @param {Boolean} loading - Estado de carga
 * @param {Function} onPageChange - Función para cambiar página (opcional si usas paginación externa)
 * @param {Object} pagination - { currentPage, totalPages, totalItems, itemsPerPage }
 */
function DynamicTable({ columns, data, loading, pagination, onPageChange }) {
    
    // Renderizado de Estado de Carga
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                Cargando datos...
            </div>
        );
    }

    // Renderizado de Estado Vacío
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                No hay registros para mostrar.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            {columns.map((col, index) => (
                                <th 
                                    key={index} 
                                    className={`p-4 ${index === 0 ? 'rounded-tl-2xl' : ''} ${index === columns.length - 1 ? 'rounded-tr-2xl text-right' : ''} ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-pink-50/30 transition-colors group">
                                {columns.map((col, colIndex) => (
                                    <td 
                                        key={`${rowIndex}-${colIndex}`} 
                                        className={`p-4 ${colIndex === columns.length - 1 ? 'text-right' : ''}`}
                                    >
                                        {/* Si la columna tiene una función 'render', la usamos. Si no, mostramos el dato directo */}
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación Integrada */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 mt-auto">
                    <span className="text-sm text-gray-500">
                        Página {pagination.currentPage} de {pagination.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onPageChange(pagination.currentPage - 1)} 
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {/* Renderizado simple de números (limitado a 5 para no saturar) */}
                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Mostrar solo páginas cercanas (lógica simple)
                            if (Math.abs(pagination.currentPage - pageNum) <= 2 || pageNum === 1 || pageNum === pagination.totalPages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            pagination.currentPage === pageNum 
                                                ? 'bg-pink-500 text-white shadow-sm' 
                                                : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        <button 
                            onClick={() => onPageChange(pagination.currentPage + 1)} 
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DynamicTable;