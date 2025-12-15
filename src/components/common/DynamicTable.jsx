import React from 'react';
import { ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';

function DynamicTable({ columns, data, loading, pagination, onPageChange, itemsPerPage, onItemsPerPageChange, compact = false, selectable = false, selectedItems = [], onSelectionChange }) {

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="text-gray-500 font-medium">Cargando datos...</span>
            </div>
        );
    }

    if (!data || data.length === 0) return (<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">No hay registros para mostrar.</div>);

    const allSelected = data.length > 0 && data.every(row => selectedItems.includes(row.id || row.Id));

    const handleSelectAll = () => {
        if (allSelected) {
            const newSelected = selectedItems.filter(id => !data.find(row => (row.id || row.Id) === id));
            onSelectionChange(newSelected);
        } else {
            const idsOnPage = data.map(row => row.id || row.Id);
            const newSelected = [...new Set([...selectedItems, ...idsOnPage])];
            onSelectionChange(newSelected);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedItems.includes(id)) {
            onSelectionChange(selectedItems.filter(item => item !== id));
        } else {
            onSelectionChange([...selectedItems, id]);
        }
    };

    // Cálculos seguros para visualización
    const totalItems = pagination?.totalItems || data.length;
    // Si itemsPerPage no viene (ej. dashboard), usamos el tamaño de data para evitar NaN
    const safeItemsPerPage = itemsPerPage || data.length || 1;
    const indexOfLastItem = pagination ? pagination.currentPage * safeItemsPerPage : data.length;
    const indexOfFirstItem = indexOfLastItem - safeItemsPerPage;

    return (
        // FIX 1: Quitamos 'h-full' y 'flex flex-col' para que no se estire forzosamente.
        // Usamos 'w-full' para el ancho y dejamos que la altura sea automática.
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">

            {/* Contenedor Tabla con Scroll Horizontal si es necesario */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {/* CHECKBOX HEADER */}
                            {selectable && (
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {columns.map((col, index) => (
                                <th key={index} className={`p-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, rowIndex) => {
                            const rowId = row.id || row.Id;
                            const isSelected = selectedItems.includes(rowId);

                            return (
                                <tr key={rowIndex} className={`hover:bg-pink-50/30 transition-colors ${isSelected ? 'bg-pink-50/40' : ''}`}>
                                    {/* CHECKBOX ROW */}
                                    {selectable && (
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(rowId)}
                                            />
                                        </td>
                                    )}

                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`p-4 text-sm text-gray-600 ${col.className || ''}`}>
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>


            {/* Paginación Adaptativa */}
            {pagination && pagination.totalPages > 0 && (
                <div className={`
                    border-t border-gray-100 bg-gray-50 flex items-center transition-all
                    ${compact ? 'justify-center p-2' : 'justify-between px-6 py-4 flex-col sm:flex-row gap-4'}
                `}>
                    {/* Texto informativo: SE OCULTA si está en modo compacto */}
                    {!compact && (
                        <div className="text-sm text-gray-500 text-center sm:text-left">
                            Mostrando <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> a <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, totalItems)}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
                        </div>
                    )}

                    {/* Botones */}
                    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
                        <button
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className={`
                                rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white flex items-center justify-center
                                ${compact ? 'w-7 h-7 p-0' : 'p-1.5'}
                            `}
                        >
                            <ChevronLeft size={compact ? 14 : 16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                                // Lógica simple para mostrar paginas cercanas + primera + ultima
                                if (
                                    pageNum === 1 ||
                                    pageNum === pagination.totalPages ||
                                    (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`
                                                rounded-lg font-bold transition-all flex items-center justify-center
                                                ${compact ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'}
                                                ${pagination.currentPage === pageNum
                                                    ? 'bg-pink-500 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                                }
                                            `}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                // Puntos suspensivos
                                if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                                    return <span key={pageNum} className="text-gray-400 text-xs px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className={`
                                rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white flex items-center justify-center
                                ${compact ? 'w-7 h-7 p-0' : 'p-1.5'}
                            `}
                        >
                            <ChevronRight size={compact ? 14 : 16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DynamicTable;