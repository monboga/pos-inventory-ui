import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // <--- CLAVE PARA FLOTAR SOBRE EL MODAL
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const dropdownVariants = {
    hidden: { 
        opacity: 0, 
        y: -10, 
        scaleY: 0.95, 
        transformOrigin: "top" 
    },
    visible: { 
        opacity: 1, 
        y: 0, 
        scaleY: 1,
        transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
        }
    },
    exit: { 
        opacity: 0, 
        y: -10, 
        scaleY: 0.95, 
        transition: { duration: 0.15 } 
    }
};

const AnimatedSelect = ({ 
    label, 
    options = [], 
    value, 
    onChange, 
    icon: Icon, 
    placeholder = "Seleccionar...", 
    disabled = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => (opt.id || opt.Id) == value);

    // Calcular posición exacta en la pantalla al abrir
    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4, // 4px de gap
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    // Actualizar coordenadas al abrir
    useEffect(() => {
        if (isOpen) {
            updateCoords();
            // Cierra el menú si el usuario hace scroll en la ventana o cambia el tamaño
            // Esto evita que el menú flotante se quede "despegado" del input
            window.addEventListener("scroll", () => setIsOpen(false), true); 
            window.addEventListener("resize", () => setIsOpen(false));
        }
        return () => {
            window.removeEventListener("scroll", () => setIsOpen(false), true);
            window.removeEventListener("resize", () => setIsOpen(false));
        };
    }, [isOpen]);

    // Cerrar clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nota: Al usar Portal, el menú ya no está "dentro" del containerRef en el DOM,
            // pero lógica de React suele propagar eventos. Para seguridad, verificamos ambos.
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                // Verificación simple: si el clic no fue en el botón, cerramos.
                // (El clic dentro del menú se maneja en handleSelect)
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (optionId) => {
        onChange(optionId);
        setIsOpen(false);
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
            
            {/* BOTÓN TRIGGER */}
            <button
                type="button"
                onClick={() => {
                    if (!disabled) {
                        updateCoords(); // Recalcular antes de abrir por si acaso
                        setIsOpen(!isOpen);
                    }
                }}
                disabled={disabled}
                className={`
                    w-full relative flex items-center justify-between
                    pl-10 pr-4 py-2.5 border rounded-xl text-left bg-white
                    transition-all duration-200 outline-none
                    ${isOpen 
                        ? 'border-pink-500 ring-2 ring-pink-500/10' // Ring más sutil
                        : 'border-gray-200 hover:border-gray-300'
                    }
                    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'cursor-pointer'}
                `}
            >
                {Icon && (
                    <Icon 
                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-pink-500' : 'text-gray-400'}`} 
                        size={18} 
                    />
                )}

                <span className={`block truncate text-sm ${!selectedOption ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {selectedOption ? (selectedOption.name || selectedOption.Name) : placeholder}
                </span>

                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className={`h-4 w-4 ${isOpen ? 'text-pink-500' : 'text-gray-400'}`} />
                    </motion.div>
                </span>
            </button>

            {/* PORTAL: Renderiza el menú fuera del DOM actual (en el body) */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.ul
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                position: 'fixed', // Posición fija en pantalla
                                top: coords.top,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 9999 // Z-Index muy alto para ganar al Modal (que suele ser 50)
                            }}
                            className="
                                bg-white shadow-2xl rounded-xl py-1 text-base 
                                border border-gray-100 max-h-60 overflow-auto focus:outline-none custom-scrollbar
                            "
                        >
                            {options.length === 0 ? (
                                <li className="text-gray-400 select-none relative py-3 pl-3 pr-9 text-sm text-center">
                                    No hay opciones disponibles
                                </li>
                            ) : (
                                options.map((option) => {
                                    const isSelected = (option.id || option.Id) == value;
                                    return (
                                        <li
                                            key={option.id || option.Id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evitar cerrar inmediatamente por evento externo
                                                handleSelect(option.id || option.Id);
                                            }}
                                            className={`
                                                cursor-pointer select-none relative py-2.5 pl-10 pr-4 transition-colors text-sm
                                                ${isSelected ? 'bg-pink-50 text-pink-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                            `}
                                        >
                                            {isSelected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-500">
                                                    <Check className="h-4 w-4" />
                                                </span>
                                            )}
                                            <span className="block truncate">
                                                {option.name || option.Name}
                                            </span>
                                        </li>
                                    );
                                })
                            )}
                        </motion.ul>
                    )}
                </AnimatePresence>,
                document.body // Destino del Portal
            )}
        </div>
    );
};

export default AnimatedSelect;