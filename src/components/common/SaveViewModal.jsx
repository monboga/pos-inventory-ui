import React, { useState } from 'react';
import { X, Save, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMACIONES ---
const backdropVariants = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1 }, 
    exit: { opacity: 0 } 
};

const modalVariants = { 
    hidden: { scale: 0.95, y: 20, opacity: 0 }, 
    visible: { 
        scale: 1, 
        y: 0, 
        opacity: 1, 
        transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } 
    }, 
    exit: { 
        scale: 0.95, 
        y: 20, 
        opacity: 0, 
        transition: { duration: 0.15 } 
    } 
};

function SaveViewModal({ isOpen, onClose, onSave }) {
    const [viewName, setViewName] = useState("");

    // Nota: Eliminamos el "if (!isOpen) return null" aquí 
    // para dejar que AnimatePresence maneje la salida.

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!viewName.trim()) return;
        
        onSave(viewName);
        setViewName(""); // Limpiar input
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* 1. BACKDROP (Fondo Oscuro) */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* 2. MODAL (Contenedor Blanco Sólido) */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Layout size={20} className="text-pink-500" />
                                Guardar Vista Actual
                            </h2>
                            <button 
                                onClick={onClose} 
                                className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la vista
                                </label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="Ej. Usuarios Activos..." 
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300"
                                    value={viewName}
                                    onChange={(e) => setViewName(e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Se guardarán los filtros de búsqueda y configuración actuales.
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={!viewName.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} /> Guardar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default SaveViewModal;