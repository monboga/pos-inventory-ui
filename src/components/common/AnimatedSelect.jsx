import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => {
        const optId = opt.id !== undefined ? opt.id : opt.Id;
        return String(optId) === String(value);
    });

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        const handleScroll = (e) => {
            if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
            if (isOpen) setIsOpen(false);
        };
        const handleResize = () => setIsOpen(false);

        if (isOpen) {
            updateCoords();
            window.addEventListener("scroll", handleScroll, true);
            window.addEventListener("resize", handleResize);
        }
        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && containerRef.current.contains(event.target)) return;
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) return;
            setIsOpen(false);
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
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 truncate">{label}</label>}

            {/* BOTÓN TRIGGER */}
            <button
                type="button"
                onClick={() => {
                    if (!disabled) {
                        updateCoords();
                        setIsOpen(!isOpen);
                    }
                }}
                disabled={disabled}
                className={`
                    w-full relative flex items-center justify-between
                    pl-10 pr-4 py-2.5 border rounded-xl text-left bg-white
                    transition-all duration-200 outline-none
                    ${isOpen
                        ? 'border-pink-500 ring-2 ring-pink-500/10'
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

                {/* El seleccionado se mantiene en una línea (truncate) para no romper el form visualmente */}
                <span className={`block truncate mr-2 ${!selectedOption ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {selectedOption ? (selectedOption.name || selectedOption.Name) : placeholder}
                </span>

                <span className="pointer-events-none flex items-center">
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className={`h-4 w-4 ${isOpen ? 'text-pink-500' : 'text-gray-400'}`} />
                    </motion.div>
                </span>
            </button>

            {/* PORTAL */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            key="dropdown"
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 9999
                            }}
                        >
                            <ul
                                ref={dropdownRef}
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
                                        const optId = option.id !== undefined ? option.id : option.Id;
                                        const isSelected = String(optId) === String(value);

                                        return (
                                            <li
                                                key={optId}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSelect(optId);
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
                                                
                                                {/* --- FIX AQUI: Cambio de 'truncate' a 'whitespace-normal' --- */}
                                                <span className="block whitespace-normal break-words leading-snug">
                                                    {option.name || option.Name}
                                                </span>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default AnimatedSelect;