import React from 'react';
import { delay, motion } from 'framer-motion';
import { Search, LayoutGrid, Tag, Sparkles } from 'lucide-react';

const StoreSearchConfig = ({ 
    searchTerm, 
    setSearchTerm, 
    categories, 
    activeCategory, 
    onSelectCategory 
}) => {
    
    // Filtramos para mostrar solo categorías activas (isActive === true o 1)
    const activeCategories = categories.filter(cat => 
        (cat.isActive === true || cat.isActive === 1 || cat.IsActive === true || cat.IsActive === 1)
    );

    // Variantes de animación para el efecto de rebote al aparecer
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03, 
                delayChildren: 0.05,
                useNextTick: true
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.8 },
        visible: { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 15 // Efecto de rebote
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* BUSCADOR PROFESIONAL ALBA POS */}
            <div className="relative group">
                <Search 
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" 
                    size={20} 
                />
                <input
                    type="text"
                    placeholder="Buscar por nombre de insumo..."
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-pink-50 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* FILTROS DE CATEGORÍA CON DISEÑO ROSA ALBA */}
            <motion.div 
                layout // Permite que Framer Motion gestione los cambios de posición suavemente
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={activeCategories.length} 
                className="flex gap-3 overflow-x-auto pb-4 pt-1 custom-scrollbar -mx-2 px-2"
                style={{ willChange: "transform, opacity" }} // Indica al navegador que optimice estas capas
            >
                <motion.button
                    layout
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectCategory("Todos")}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                        ${activeCategory === "Todos"
                            ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200"
                            : "bg-white text-pink-400 border-pink-100 hover:bg-pink-50"}
                    `}
                >
                    <LayoutGrid size={14} strokeWidth={3} />
                    Todas
                </motion.button>
                
                {activeCategories.map((cat) => (
                    <motion.button
                        layout
                        key={cat.id || cat.Id}
                        variants={itemVariants}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectCategory(String(cat.id || cat.Id))}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                            ${activeCategory === String(cat.id || cat.Id)
                                ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200"
                                : "bg-white text-pink-400 border-pink-100 hover:bg-pink-50"}
                        `}
                    >
                        {(cat.description || cat.Description || "").toLowerCase().includes('oferta') 
                            ? <Sparkles size={14} strokeWidth={3} /> 
                            : <Tag size={14} strokeWidth={3} />
                        }
                        {cat.description || cat.Description}
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default StoreSearchConfig;