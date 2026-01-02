import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Layers, Package, PenTool, Sparkles, Box } from 'lucide-react';

const CategoryFilterModal = ({ isOpen, onClose, categories, activeCategory, onSelectCategory }) => {
    
    // Helper para asignar iconos (simulado para el diseño visual)
    const getCategoryIcon = (index) => {
        const icons = [Package, PenTool, Sparkles, Box];
        return icons[index % icons.length];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. BACKDROP LOCAL (Solo cubre el área de productos) */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 z-40 bg-white/60 backdrop-blur-sm transition-all"
                    />

                    {/* 2. MENÚ FLOTANTE (Posicionado arriba a la izquierda) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute top-6 left-6 z-50 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col"
                    >
                        {/* Header del Menú */}
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <FilterIcon /> Categorías
                            </span>
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Lista Vertical */}
                        <div className="p-2 overflow-y-auto max-h-[400px] custom-scrollbar space-y-1">
                            
                            {/* Opción TODO */}
                            <button
                                onClick={() => { onSelectCategory('Todos'); onClose(); }}
                                className={`
                                    w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3
                                    ${activeCategory === 'Todos' 
                                        ? 'bg-pink-50 text-pink-600' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Layers size={16} className={activeCategory === 'Todos' ? 'text-pink-500' : 'text-gray-400'} />
                                Todo
                                {activeCategory === 'Todos' && <Check size={14} className="ml-auto" />}
                            </button>

                            {/* Categorías Dinámicas */}
                            {categories.map((cat, index) => {
                                const isActive = activeCategory === String(cat.id || cat.Id);
                                const Icon = getCategoryIcon(index);

                                return (
                                    <button
                                        key={cat.id || cat.Id}
                                        onClick={() => { onSelectCategory(String(cat.id || cat.Id)); onClose(); }}
                                        className={`
                                            w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3
                                            ${isActive
                                                ? 'bg-pink-50 text-pink-600' 
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        <Icon size={16} className={isActive ? 'text-pink-500' : 'text-gray-400'} />
                                        <span className="truncate">{cat.description || cat.Description}</span>
                                        {isActive && <Check size={14} className="ml-auto" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Pequeño icono decorativo para el título
const FilterIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export default CategoryFilterModal;