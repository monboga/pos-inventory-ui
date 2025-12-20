import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Tag, Percent, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Variantes de animación
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = {
    hidden: { scale: 0.95, y: 20, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } },
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } }
};

function DiscountModal({ isOpen, onClose, onSubmit, discountToEdit }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ reason: '', percentage: '', isActive: true });

    useEffect(() => {
        if (isOpen) {
            if (discountToEdit) {
                setFormData({
                    // FIX: Si viene null, ponemos string vacío
                    reason: discountToEdit.reason || discountToEdit.Reason || '',
                    percentage: discountToEdit.percentage || discountToEdit.Percentage || 0,
                    isActive: discountToEdit.isActive !== undefined ? discountToEdit.isActive : (!!discountToEdit.IsActive)
                });
            } else {
                setFormData({ reason: '', percentage: '', isActive: true });
            }
        }
    }, [isOpen, discountToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Validación manual solo para porcentaje
            if (!formData.percentage && formData.percentage !== 0) {
                alert("El porcentaje es requerido");
                setIsSubmitting(false);
                return;
            }
            await onSubmit(formData);
            // El cierre lo maneja el padre si es exitoso
        } catch (error) {
            // error
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
                        onClick={onClose}
                    />

                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 flex flex-col"
                        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-xl font-bold text-gray-800">{discountToEdit ? 'Editar Descuento' : 'Nuevo Descuento'}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Motivo (Opcional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motivo <span className="text-gray-400 text-xs font-normal">(Opcional)</span>
                                </label>
                                <div className="relative">
                                    <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        // FIX: Quitamos 'required'
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Ej. Promoción Verano"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Porcentaje (Requerido) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
                                <div className="relative">
                                    <Percent size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        min="0" max="100" step="0.01"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                        placeholder="0 - 100"
                                        value={formData.percentage}
                                        onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Estado</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${formData.isActive
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}
                                >
                                    {formData.isActive ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                                </button>
                            </div>

                            <div className="pt-2 flex gap-3 justify-end border-t border-gray-50">
                                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-all">
                                    {isSubmitting ? 'Guardando...' : (discountToEdit ? <><RefreshCw size={18} /> Actualizar</> : <><Save size={18} /> Guardar</>)}
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