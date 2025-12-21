import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, FileText, Briefcase, RefreshCw, AlertCircle, Phone } from 'lucide-react'; // Agregamos Phone
import { satService } from '../../services/satService'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import AnimatedSelect from '../common/AnimatedSelect';
import toast from 'react-hot-toast';

// --- ANIMACIONES ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = { 
    hidden: { scale: 0.95, y: 20, opacity: 0 }, 
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } }, 
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } } 
};

function CustomerModal({ isOpen, onClose, onSubmit, clientToEdit }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '', // Nuevo campo
        rfc: '',
        regimenFiscalId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [regimenes, setRegimenes] = useState([]);
    
    // 1. Cargar Catálogo SAT
    useEffect(() => {
        if (isOpen) {
            const loadSatData = async () => {
                try {
                    const data = await satService.getRegimenesFiscales(); 
                    const formattedRegimenes = data.map(r => ({
                        id: r.id || r.Id,
                        name: `${r.code || r.Code} - ${r.description || r.Description}`
                    }));
                    setRegimenes(formattedRegimenes);
                } catch (err) {
                    console.error("Error cargando SAT", err);
                    toast.error("No se pudieron cargar los regímenes fiscales.");
                }
            };
            loadSatData();
        }
    }, [isOpen]);

    // 2. Cargar Datos al Editar
    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (clientToEdit) {
                const fullName = clientToEdit.fullName || clientToEdit.FullName || "";
                const parts = fullName.split(' ');
                const fName = parts[0] || "";
                const lName = parts.slice(1).join(' ') || "";

                setFormData({
                    firstName: clientToEdit.firstName || clientToEdit.FirstName || fName,
                    lastName: clientToEdit.lastName || clientToEdit.LastName || lName,
                    email: clientToEdit.email || clientToEdit.Email || '',
                    phoneNumber: clientToEdit.phoneNumber || clientToEdit.PhoneNumber || '', // Cargar teléfono
                    rfc: clientToEdit.rfc || clientToEdit.Rfc || '',
                    regimenFiscalId: clientToEdit.regimenFiscalId || clientToEdit.RegimenFiscalId || ''
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, clientToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validaciones manuales
        if (!formData.phoneNumber) {
            const msg = "⚠️ El número de teléfono es obligatorio";
            toast.error(msg);
            return;
        }

        if (!formData.regimenFiscalId) {
            const msg = "⚠️ Debes seleccionar un Régimen Fiscal";
            toast.error(msg);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.message || "Error al guardar el cliente.";
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
                    {/* BACKDROP */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* MODAL */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Nombres y Apellidos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" required 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300" 
                                            placeholder="Ej. Ana"
                                            value={formData.firstName} 
                                            onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido(s) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" required 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300" 
                                            placeholder="Ej. García"
                                            value={formData.lastName} 
                                            onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contacto: Teléfono (Obligatorio) y Email (Opcional) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="tel" required 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300" 
                                            placeholder="55 1234 5678"
                                            value={formData.phoneNumber} 
                                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo <span className="text-gray-400 text-xs font-normal">(Opcional)</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="email" 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder:text-gray-300" 
                                            placeholder="cliente@empresa.com"
                                            value={formData.email} 
                                            onChange={e => setFormData({...formData, email: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Datos Fiscales */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><FileText size={16} className="text-pink-500"/> Datos Fiscales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RFC</label>
                                        <input 
                                            type="text" required 
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none uppercase font-mono transition-all" 
                                            placeholder="XAXX010101000" maxLength={13}
                                            value={formData.rfc} 
                                            onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase()})} 
                                        />
                                    </div>
                                    
                                    {/* ANIMATED SELECT */}
                                    <div className="z-50">
                                        <AnimatedSelect
                                            label="Régimen Fiscal"
                                            options={regimenes}
                                            value={formData.regimenFiscalId}
                                            onChange={(val) => setFormData({ ...formData, regimenFiscalId: val })}
                                            icon={Briefcase}
                                            placeholder="Seleccionar..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
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
                                    className={`flex items-center gap-2 px-6 py-2 text-white rounded-xl font-medium shadow-sm transition-all ${
                                        isSubmitting ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>Guardando...</>
                                    ) : (
                                        clientToEdit ? <><RefreshCw size={18} /> Actualizar Cliente</> : <><Save size={18} /> Guardar Cliente</>
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

export default CustomerModal;