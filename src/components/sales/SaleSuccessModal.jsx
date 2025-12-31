import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Check } from 'lucide-react';

import { formatDateTime } from '../../utils/dateUtils';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: { 
        scale: 1, 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { scale: 0.95, opacity: 0, y: 10 }
};

// Icono de Éxito Limpio y Animado
const SuccessIcon = () => (
    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2 relative">
        <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200"
        >
            <Check size={28} strokeWidth={4} className="text-white" />
        </motion.div>
    </div>
);

function SaleSuccessModal({ isOpen, onClose, saleData, onPrint }) {
    if (!saleData) return null;

    // Formatear Fecha (Ej: 21 de diciembre de 2025)
    const dateStr = formatDateTime(saleData.registrationDate, {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden" animate="visible" exit="exit"
                    />

                    <motion.div 
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative z-10 flex flex-col items-center p-8 text-center"
                        variants={modalVariants}
                        initial="hidden" animate="visible" exit="exit"
                    >
                        {/* 1. Icono */}
                        <SuccessIcon />

                        {/* 2. Títulos */}
                        <h2 className="text-xl font-extrabold text-gray-800 mb-1 tracking-tight">¡Venta Exitosa!</h2>
                        <p className="text-4xl font-black text-green-500 mb-8 tracking-tight">
                            ${Number(saleData.total).toFixed(2)}
                        </p>

                        {/* 3. Detalles (Minimalista, sin bordes ni líneas) */}
                        <div className="w-full bg-gray-50/80 rounded-2xl p-6 space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold capitalize">Folio</span>
                                <span className="font-bold text-gray-800">{saleData.saleNumber || "---"}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold capitalize">Método</span>
                                <span className="font-bold text-gray-800">Efectivo</span>
                            </div>
                            
                            <div className="flex justify-between items-start text-sm">
                                <span className="text-gray-400 font-bold capitalize">Fecha</span>
                                <span className="font-bold text-gray-800 text-right max-w-[150px] leading-tight">
                                    {dateStr}
                                </span>
                            </div>
                        </div>

                        {/* 4. Botones */}
                        <div className="w-full space-y-3">
                            {/* Botón Principal (Rosa ALBA) */}
                            <button 
                                onClick={onClose} 
                                className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold shadow-xl shadow-pink-200/50 transition-all active:scale-95 text-base"
                            >
                                Nueva Venta
                            </button>

                            {/* Botón Secundario (Sin bordes, Icono Rosa) */}
                            <button 
                                onClick={() => onPrint(saleData.id)}
                                className="w-full py-3 bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Printer size={18} className="text-pink-500" />
                                Imprimir Ticket
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default SaleSuccessModal;