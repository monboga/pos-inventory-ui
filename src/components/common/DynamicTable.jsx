import React from 'react';
import { ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';

function DynamicTable({ columns, data, loading, pagination, onPageChange, itemsPerPage, onItemsPerPageChange }) {
    
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="text-gray-500 font-medium">Cargando datos...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                No hay registros para mostrar.
            </div>
        );
    }

    return (
        // FIX 1: Quitamos 'h-full' y 'flex flex-col' para que no se estire forzosamente.
        // Usamos 'w-full' para el ancho y dejamos que la altura sea automática.
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
            
            {/* Contenedor Tabla con Scroll Horizontal si es necesario */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            {columns.map((col, index) => (
                                <th 
                                    key={index} 
                                    className={`p-4 whitespace-nowrap ${index === 0 ? 'pl-6' : ''} ${index === columns.length - 1 ? 'pr-6 text-right' : ''} ${col.className || ''}`}
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
                                        className={`p-4 text-sm text-gray-700 whitespace-nowrap ${colIndex === 0 ? 'pl-6' : ''} ${colIndex === columns.length - 1 ? 'pr-6 text-right' : ''} ${col.className || ''}`}
                                    >
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer: Paginación + Selector de Items */}
            {pagination && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* --- FEATURE: SELECTOR DE ITEMS POR PÁGINA --- */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium order-2 sm:order-1">
                        <ListFilter size={14} />
                        <span>Mostrar</span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange && onItemsPerPageChange(Number(e.target.value))}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>filas</span>
                    </div>

                    {/* Controles de Paginación */}
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <span className="text-sm text-gray-500 mr-2">
                            Página {pagination.currentPage} de {pagination.totalPages}
                        </span>
                        
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => onPageChange(pagination.currentPage - 1)} 
                                disabled={pagination.currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {/* Números de página simplificados */}
                            <div className="hidden sm:flex gap-1">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Lógica simple para no mostrar demasiados números
                                    if (Math.abs(pagination.currentPage - pageNum) <= 1 || pageNum === 1 || pageNum === pagination.totalPages) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => onPageChange(pageNum)}
                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                    pagination.currentPage === pageNum 
                                                        ? 'bg-pink-500 text-white shadow-md' 
                                                        : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                onClick={() => onPageChange(pagination.currentPage + 1)} 
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DynamicTable;