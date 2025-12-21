import React, { useState, useEffect } from 'react';
import { X, Save, Percent, Type, Layers, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { 
        scale: 1, opacity: 1, y: 0,
        transition: { type: "spring", stiffness: 350, damping: 25 }
    },
    exit: { scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.15 } }
};

function DiscountModal({ isOpen, onClose, onSave, discountToEdit }) {
    const [formData, setFormData] = useState({
        reason: '',
        percentage: '',
        minQuantity: '1', // 1 = Descuento directo estándar
        isActive: true
    });

    useEffect(() => {
        if (isOpen) {
            if (discountToEdit) {
                setFormData({
                    reason: discountToEdit.name || discountToEdit.reason || '',
                    percentage: discountToEdit.percentage || '',
                    minQuantity: discountToEdit.minQuantity || '1',
                    isActive: discountToEdit.isActive ?? true
                });
            } else {
                setFormData({ reason: '', percentage: '', minQuantity: '1', isActive: true });
            }
        }
    }, [isOpen, discountToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) return toast.error("El nombre es obligatorio");
        if (formData.percentage <= 0 || formData.percentage > 100) return toast.error("Porcentaje inválido (1-100)");
        if (formData.minQuantity < 1) return toast.error("La cantidad mínima debe ser al menos 1");

        const payload = {
            ...formData,
            percentage: Number(formData.percentage),
            minQuantity: Number(formData.minQuantity)
        };

        onSave(payload);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose}
                    />

                    <motion.div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                    >
                        {/* Header Minimalista */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className={`p-2 rounded-xl ${formData.minQuantity > 1 ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                    {formData.minQuantity > 1 ? <Layers size={20}/> : <Percent size={20}/>}
                                </span>
                                {discountToEdit ? 'Editar Descuento' : 'Nuevo Descuento'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"><X size={20} /></button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            
                            {/* Input: Nombre */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre de la Promoción</label>
                                <div className="relative group">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                                    <input 
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="Ej: Mayoristas, Buen Fin..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Input: Porcentaje */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Porcentaje %</label>
                                    <div className="relative group">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                                        <input 
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-bold text-gray-800"
                                            placeholder="0"
                                            min="1" max="100"
                                            value={formData.percentage}
                                            onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Input: Cantidad Mínima (HIGHLIGHT) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                        Min. Piezas
                                        <div className="group/tooltip relative">
                                            <Info size={12} className="text-gray-300 hover:text-blue-400 cursor-help transition-colors"/>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-800 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-tight">
                                                Si es mayor a 1, el descuento solo aplica al llevar esa cantidad.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative group">
                                        <Layers className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${formData.minQuantity > 1 ? 'text-blue-500' : 'text-gray-400'}`} size={18} />
                                        <input 
                                            type="number"
                                            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-bold ${formData.minQuantity > 1 ? 'border-blue-200 focus:ring-blue-500/20 focus:border-blue-500 text-blue-700' : 'border-gray-200 focus:ring-pink-500/20 focus:border-pink-500 text-gray-800'}`}
                                            placeholder="1"
                                            min="1"
                                            value={formData.minQuantity}
                                            onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Switch Activo */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-700">Estado Activo</span>
                                    <span className="text-[10px] text-gray-400">Habilitar o deshabilitar regla</span>
                                </div>
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-2 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3.5 bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Save size={18} />
                                    Guardar Regla
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default DiscountModal;