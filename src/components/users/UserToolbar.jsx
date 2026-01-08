import React from 'react';
import { ListFilter, ArrowUpDown, Plus } from 'lucide-react'; // Cambiamos Filter por ListFilter
import ExpandableSearch from '../common/ExpandableSearch';
import TableFilterPopover, { FilterOption } from '../common/TableFilterPopover';
import ViewSelector from '../common/ViewSelector';

function UserToolbar({ 
    searchTerm, 
    onSearchChange, 
    statusFilter, 
    onStatusChange, 
    currentFiltersState, 
    onApplyView,
    onCreateClick 
}) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 w-full animate-in fade-in slide-in-from-top-2">
            
            {/* GRUPO IZQUIERDA: Solo Selector de Vistas */}
            <div className="w-full md:w-auto flex justify-start">
                 <ViewSelector
                    entityName="Users"
                    currentFilters={currentFiltersState}
                    onApplyView={onApplyView}
                />
            </div>

            {/* GRUPO DERECHA: Buscador -> Filtros -> Sort -> Acción */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                
                {/* 1. BUSCADOR (Ahora a la izquierda de los filtros) */}
                <ExpandableSearch 
                    value={searchTerm} 
                    onChange={onSearchChange} 
                />

                {/* Separador vertical sutil */}
                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                
                {/* 2. FILTRO (Status) - Sin etiqueta, Icono ListFilter */}
                <TableFilterPopover 
                    icon={ListFilter} 
                    isActive={statusFilter !== null}
                    // label="Estado"  <-- ELIMINADO PARA MINIMALISMO
                >
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Filtrar por estado</div>
                    <FilterOption 
                        label="Todos" 
                        isSelected={statusFilter === null} 
                        onClick={() => onStatusChange(null)} 
                    />
                    <FilterOption 
                        label="Activos" 
                        isSelected={statusFilter === true} 
                        onClick={() => onStatusChange(true)}
                        color="green"
                    />
                    <FilterOption 
                        label="Inactivos" 
                        isSelected={statusFilter === false} 
                        onClick={() => onStatusChange(false)}
                        color="red"
                    />
                </TableFilterPopover>

                {/* 3. SORT (Visual) - Sin etiqueta */}
                <TableFilterPopover icon={ArrowUpDown}>
                     <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Ordenar por</div>
                     <FilterOption label="Nombre (A-Z)" isSelected={true} onClick={() => {}} />
                     <FilterOption label="Fecha creación" isSelected={false} onClick={() => {}} />
                </TableFilterPopover>

                {/* 4. BOTÓN CREAR */}
                <button 
                    onClick={onCreateClick} 
                    className="ml-2 flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Nuevo</span>
                </button>
            </div>
        </div>
    );
}

export default UserToolbar;