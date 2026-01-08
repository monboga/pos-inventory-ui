import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ExpandableSearch({ value, onChange, placeholder = "Buscar..." }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus al expandir
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleIconClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <motion.div
            initial={false}
            // Ancho base (solo icono) vs Ancho expandido
            animate={{ width: isExpanded ? 240 : 40 }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
                h-10 flex items-center overflow-hidden rounded-lg transition-colors border
                ${isExpanded 
                    ? 'bg-white border-pink-500 ring-2 ring-pink-500/10' 
                    : 'bg-transparent border-transparent hover:bg-gray-100' // Transparente por defecto
                }
            `}
        >
            {/* BOTÓN INTERRUPTOR (Icono) */}
            <button
                type="button"
                onClick={handleIconClick}
                className={`
                    min-w-[40px] h-full flex items-center justify-center transition-colors
                    ${isExpanded ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'}
                `}
            >
                <Search size={18} />
            </button>

            {/* INPUT (Solo visible si está expandido o animando) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.input
                        ref={inputRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        type="text"
                        className="w-full h-full bg-transparent outline-none text-sm text-gray-700 pr-4 placeholder:text-gray-400"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default ExpandableSearch;