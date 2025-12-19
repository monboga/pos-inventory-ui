import React from 'react';
import { createPortal } from 'react-dom'; // 1. Para renderizar fuera del flujo normal
import { X, FileText, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 2. Para animaciones

function SaleConfirmationModal({ isOpen, onClose, onConfirm }) {
    
    // Configuramos las animaciones
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const modalVariants = {
        hidden: { 
            scale: 0.5, 
            opacity: 0, 
            y: 100 
        },
        visible: { 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: { 
                type: "spring", // El efecto de rebote solicitado
                stiffness: 400, 
                damping: 25,
                mass: 0.5 
            }
        },
        exit: { 
            scale: 0.9, 
            opacity: 0, 
            transition: { duration: 0.15 } 
        }
    };

    // Usamos Portal para que el modal "salga" de los contenedores del layout
    // y cubra el Sidebar (que suele tener z-50). Usamos z-[9999] para asegurar.
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose} // Cerrar al dar clic fuera
                >
                    <motion.div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 relative"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()} // Evitar cierre al clic dentro
                    >
                        
                        {/* Botón de cierre absoluto */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center">
                            {/* Icono decorativo superior */}
                            <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-500 shadow-sm">
                                <Receipt size={32} />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                                Confirmar Venta
                            </h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Selecciona el tipo de comprobante que deseas generar para esta transacción.
                            </p>

                            <div className="space-y-3">
                                {/* Opción NO (Ticket - Principal) */}
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onConfirm('Ticket')}
                                    className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-3 transition-all"
                                >
                                    <Receipt size={20} /> 
                                    <span>Generar Ticket</span>
                                </motion.button>

                                {/* Opción SI (Factura - Secundaria) */}
                                <motion.button 
                                    whileHover={{ scale: 1.02, backgroundColor: '#f3e8ff' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => alert("Funcionalidad de Facturación (Timbrado) pendiente de implementación.")}
                                    className="w-full py-3.5 px-4 bg-purple-50 text-purple-700 font-bold rounded-xl border border-purple-200 hover:border-purple-300 flex items-center justify-center gap-3 transition-all"
                                >
                                    <FileText size={20} /> 
                                    <span>Facturar Venta</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Footer sutil */}
                        <div className="bg-gray-50/80 p-4 text-center border-t border-gray-100">
                            <button 
                                onClick={onClose} 
                                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                            >
                                Cancelar operación
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body // <-- Aquí está la magia: Renderiza en el body
    );
}

export default SaleConfirmationModal;