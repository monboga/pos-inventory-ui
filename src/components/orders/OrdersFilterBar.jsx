import React from 'react';
import { Search, List, LayoutGrid } from 'lucide-react';

const OrdersFilterBar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, viewMode, setViewMode }) => {
    const statuses = [
        { id: 'Pending', label: 'Pendientes' },
        { id: 'Confirmed', label: 'Confirmados' },
        { id: 'Completed', label: 'Completados' },
        { id: 'Incoming', label: 'En camino' },
        { id: 'All', label: 'Todos' }
    ];

    return (
        /* Aumentamos el padding a px-8 para dar aire a los elementos de las orillas */
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white px-8 py-6 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            
            {/* BUSCADOR CON DISEÑO SOFT */}
            <div className="relative w-full lg:flex-1 max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar cliente o folio..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-pink-100 focus:ring-4 focus:ring-pink-50/50 outline-none font-bold text-xs transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CONTENEDOR DE FILTROS */}
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                <div className="flex bg-gray-50 p-1.5 rounded-[1.8rem] border border-gray-100">
                    {statuses.map(status => (
                        <button
                            key={status.id}
                            onClick={() => setFilterStatus(status.id)}
                            className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                                filterStatus === status.id 
                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 scale-105' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-gray-200 mx-2 hidden lg:block" />

                {/* TOGGLE DE VISTA */}
                <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'text-pink-500 bg-white shadow-sm' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'text-pink-500 bg-white shadow-sm' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersFilterBar;