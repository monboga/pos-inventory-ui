import React from 'react';
import { Search } from 'lucide-react';

const StoreSearchConfig = ({ 
    searchTerm, 
    setSearchTerm, 
    categories, 
    activeCategory, 
    onSelectCategory 
}) => {
    return (
        <div className="space-y-6">
            {/* BUSCADOR PROFESIONAL */}
            <div className="relative group">
                <Search 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" 
                    size={20} 
                />
                <input
                    type="text"
                    placeholder="Buscar por nombre de insumo..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-pink-50 transition-all font-medium text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* FILTROS DE CATEGORÍA (SIEMPRE VISIBLES) */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
                <button
                    onClick={() => onSelectCategory("Todos")}
                    className={`
                        px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                        ${activeCategory === "Todos"
                            ? "bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105"
                            : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"}
                    `}
                >
                    Todos
                </button>
                
                {categories.map(cat => (
                    <button
                        key={cat.id || cat.Id}
                        onClick={() => onSelectCategory(String(cat.id || cat.Id))}
                        className={`
                            px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                            ${activeCategory === String(cat.id || cat.Id)
                                ? "bg-pink-500 text-white shadow-lg shadow-pink-200 scale-105"
                                : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"}
                        `}
                    >
                        {cat.description || cat.Description}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StoreSearchConfig;