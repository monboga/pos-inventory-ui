import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Tag } from 'lucide-react';

// Variantes para la animación de entrada (Cascada)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08 // Retraso entre cada píldora
        }
    }
};

// Variantes para cada botón (Rebote)
const itemVariants = {
    hidden: { y: -20, opacity: 0, scale: 0.5 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 }
    }
};

const CategoryFilter = ({ categories, activeCategory, onSelectCategory }) => {
    return (
        <div className="w-full py-2">
            {/* Título pequeño opcional o simplemente el scroll */}
            {/* Contenedor Scrollable */}
            <motion.div 
                className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-1 custom-scrollbar -mx-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Opción "Todos" */}
                <CategoryPill 
                    label="Todos" 
                    isActive={activeCategory === 'Todos'} 
                    onClick={() => onSelectCategory('Todos')}
                    icon={Layers}
                />

                {/* Divisor visual sutil */}
                <motion.div variants={itemVariants} className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

                {/* Categorías Dinámicas */}
                {categories.map((cat) => (
                    <CategoryPill 
                        key={cat.id || cat.Id}
                        label={cat.description || cat.Description}
                        isActive={activeCategory === String(cat.id || cat.Id)}
                        onClick={() => onSelectCategory(String(cat.id || cat.Id))}
                        // Si quieres iconos por categoría, podrías mapearlos aquí, por defecto usamos Tag
                        icon={Tag} 
                    />
                ))}
            </motion.div>
        </div>
    );
};

// Sub-componente para cada Botón (Píldora)
const CategoryPill = ({ label, isActive, onClick, icon: Icon }) => {
    return (
        <motion.button
            variants={itemVariants}
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`
                group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all outline-none
                ${isActive 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 ring-2 ring-pink-100 ring-offset-1' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-pink-200 hover:text-pink-500 shadow-sm hover:shadow-md'
                }
            `}
        >
            {/* Icono con transición de color */}
            {Icon && (
                <Icon 
                    size={16} 
                    className={`transition-colors ${isActive ? "text-pink-100" : "text-gray-400 group-hover:text-pink-400"}`} 
                />
            )}
            
            <span>{label}</span>

            {/* Indicador de activo (puntito) opcional */}
            {isActive && (
                <motion.div 
                    layoutId="activeDot"
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-pink-500 rounded-full"
                />
            )}
        </motion.button>
    );
};

export default CategoryFilter;