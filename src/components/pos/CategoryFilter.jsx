import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Tag } from 'lucide-react';

// CONFIGURACIÓN DE ANIMACIÓN OPTIMIZADA
// Usamos tiempos muy cortos para que no se sienta "trabado"
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03, // Muy rápido (30ms entre items)
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 15, opacity: 0, scale: 0.9 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { 
            type: "spring", 
            stiffness: 400, // Alto = Rápido
            damping: 25,    // Alto = Sin rebote excesivo (frena rápido)
            mass: 0.5 
        }
    }
};

const CategoryFilter = ({ categories, activeCategory, onSelectCategory }) => {
    return (
        <div className="w-full py-2">
            <motion.div 
                className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 px-1 custom-scrollbar -mx-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Opción "Todos" */}
                <CategoryPill 
                    id="Todos"
                    label="Todos" 
                    isActive={activeCategory === 'Todos'} 
                    onClick={() => onSelectCategory('Todos')}
                    icon={Layers}
                />

                {/* Divisor */}
                <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />

                {/* Categorías Dinámicas */}
                {categories.map((cat) => (
                    <CategoryPill 
                        key={cat.id || cat.Id}
                        id={String(cat.id || cat.Id)}
                        label={cat.description || cat.Description}
                        isActive={activeCategory === String(cat.id || cat.Id)}
                        onClick={() => onSelectCategory(String(cat.id || cat.Id))}
                        icon={Tag} 
                    />
                ))}
            </motion.div>
        </div>
    );
};

// --- SUB-COMPONENTE PILL OPTIMIZADO ---
const CategoryPill = ({ id, label, isActive, onClick, icon: Icon }) => {
    return (
        <motion.button
            variants={itemVariants}
            onClick={onClick}
            // Eliminamos hover complex para evitar lag, solo escala sutil
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.95 }}
            className={`
                relative flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-colors outline-none z-0
                ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700'}
            `}
        >
            {/* FONDO ANIMADO FLOTANTE (Magic Motion) */}
            {/* Esto crea el efecto de que el fondo se desliza de un botón a otro */}
            {isActive && (
                <motion.div
                    layoutId="activeCategoryBackground" // ID único compartido
                    className="absolute inset-0 bg-pink-500 rounded-2xl shadow-md shadow-pink-200 -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            {/* Contenido (debe estar por encima del fondo) */}
            <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon size={16} className={isActive ? "text-white" : "text-gray-400"} />}
                {label}
            </span>
        </motion.button>
    );
};

export default CategoryFilter;