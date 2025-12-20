import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Save, Tag, ToggleLeft, ToggleRight, AlertCircle, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { discountService } from '../../services/discountService';
import AnimatedSelect from '../common/AnimatedSelect';

// --- VARIANTES DE ANIMACIÓN ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = {
    hidden: { scale: 0.95, y: 20, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } },
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } }
};

function CategoryModal({ isOpen, onClose, onSubmit, categoryToEdit }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [discounts, setDiscounts] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState(null);

    const initialFormState = {
        description: '',
        isActive: true,
        discountId: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            const loadDiscounts = async () => {
                setLoadingData(true);
                try {
                    const data = await discountService.getAll();
                    const formatted = data
                        .filter(d => d.isActive || d.IsActive)
                        .map(d => ({
                            id: d.id || d.Id,
                            name: `${d.reason || d.Reason} (${d.percentage || d.Percentage}%)`
                        }));
                    formatted.unshift({ id: '', name: 'Sin descuento base' });
                    setDiscounts(formatted);
                } catch (e) { console.error(e); }
                finally { setLoadingData(false); }
            };
            loadDiscounts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (categoryToEdit) {
                // Modo Edición
                setFormData({
                    description: categoryToEdit.description || categoryToEdit.Description || '',
                    isActive: categoryToEdit.isActive !== undefined ? categoryToEdit.isActive : categoryToEdit.IsActive,
                    discountId: categoryToEdit.discountId || categoryToEdit.DiscountId || ''
                });
            } else {
                // Modo Crear
                setFormData({ ...initialFormState });
            }
        }
    }, [isOpen, categoryToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const dataToSend = { ...formData };
        // LÓGICA NULL: Convertir '' a null para el backend
        if (dataToSend.discountId === '') {
            dataToSend.discountId = null;
        }

        try {
            await onSubmit(dataToSend);
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.message || "Error al guardar la categoría";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Campo Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <div className="relative">
                                    <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Ej. Bebidas, Electrónica..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <AnimatedSelect
                                    label="Descuento Base por Categoría"
                                    options={discounts}
                                    value={formData.discountId}
                                    onChange={(val) => setFormData({ ...formData, discountId: val })}
                                    icon={Percent}
                                    placeholder={loadingData ? "Cargando..." : "Selecciona un descuento"}
                                />
                                {console.log("Selected discountId:", formData.discountId)}
                            </div>

                            {/* Toggle Estado */}
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
                                    {formData.isActive ? (
                                        <> <ToggleRight size={18} /> Activo </>
                                    ) : (
                                        <> <ToggleLeft size={18} /> Inactivo </>
                                    )}
                                </button>
                            </div>

                            {/* Footer Botones */}
                            <div className="pt-2 flex gap-3 justify-end border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-6 py-2 text-white rounded-xl font-medium shadow-sm transition-all ${isSubmitting ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>Guardando...</>
                                    ) : (
                                        categoryToEdit ? <><RefreshCw size={18} /> Actualizar</> : <><Save size={18} /> Guardar</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default CategoryModal;