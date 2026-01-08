import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

function TableFilterPopover({ icon: Icon, label, isActive, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    h-10 px-3 flex items-center gap-2 rounded-lg text-sm font-medium transition-all
                    ${isActive || isOpen 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                `}
            >
                <Icon size={18} />
                {label && <span>{label}</span>}
                {/* Indicador pequeño si está activo el filtro */}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-pink-500 ml-1" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                    >
                        <div className="p-1 flex flex-col gap-1">
                            {/* Pasamos una prop 'onClose' a los hijos si la necesitan, o simplemente renderizamos */}
                            {React.Children.map(children, child => 
                                React.cloneElement(child, { onClose: () => setIsOpen(false) })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Subcomponente para las opciones del menú
export function FilterOption({ label, isSelected, onClick, color = "pink" }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group
                ${isSelected ? `bg-${color}-50 text-${color}-700 font-medium` : 'text-gray-600 hover:bg-gray-50'}
            `}
        >
            <span>{label}</span>
            {isSelected && <div className={`w-2 h-2 rounded-full bg-${color}-500`} />}
        </button>
    );
}

export default TableFilterPopover;