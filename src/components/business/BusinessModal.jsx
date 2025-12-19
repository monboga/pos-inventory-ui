import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Building, MapPin, Phone, Mail, FileText, Globe, Camera, RefreshCw, Hash } from 'lucide-react';
import { satService } from '../../services/satService';
import { motion, AnimatePresence } from 'framer-motion'; 
import AnimatedSelect from '../common/AnimatedSelect';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031'; 

// --- ANIMACIONES ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = { 
    hidden: { scale: 0.95, y: 20, opacity: 0 }, 
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } }, 
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } } 
};

function BusinessModal({ isOpen, onClose, onSubmit, businessToEdit }) {
    const fileInputRef = useRef(null);
    const [regimenes, setRegimenes] = useState([]);
    
    const initialFormState = {
        rfc: '', legalName: '', email: '', address: '', phoneNumber: '', postalCode: '',
        currencyType: 'MXN', regimenFiscalId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    // Opciones estáticas para AnimatedSelect
    const currencyOptions = [
        { id: 'MXN', name: 'MXN - Peso Mexicano' },
        { id: 'USD', name: 'USD - Dólar Americano' }
    ];

    useEffect(() => {
        if (isOpen) {
            const loadCatalog = async () => {
                try {
                    const data = await satService.getRegimenesFiscales();
                    // Mapeo para AnimatedSelect {id, name}
                    const formattedRegimenes = data.map(r => ({
                        id: r.id || r.Id,
                        name: `${r.code || r.Code} - ${r.description || r.Description}`
                    }));
                    setRegimenes(formattedRegimenes);
                } catch (error) {
                    console.error("Error catálogo SAT", error);
                    toast.error("No se pudieron cargar los regímenes fiscales.");
                }
            };
            loadCatalog();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setLogoFile(null);
            if (businessToEdit) {
                let existingLogo = null;
                const rawLogo = businessToEdit.logo || businessToEdit.Logo;
                if (rawLogo) {
                    if (rawLogo.startsWith('data:') || rawLogo.startsWith('http')) {
                        existingLogo = rawLogo;
                    } else {
                        const cleanPath = rawLogo.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingLogo = `${API_BASE_URL}/${pathPart}`;
                    }
                }

                setFormData({
                    rfc: businessToEdit.rfc || businessToEdit.Rfc || '',
                    legalName: businessToEdit.legalName || businessToEdit.LegalName || '',
                    email: businessToEdit.email || businessToEdit.Email || '',
                    address: businessToEdit.address || businessToEdit.Address || '',
                    phoneNumber: businessToEdit.phoneNumber || businessToEdit.PhoneNumber || '',
                    postalCode: businessToEdit.postalCode || businessToEdit.PostalCode || '',
                    currencyType: businessToEdit.currencyType || businessToEdit.CurrencyType || 'MXN',
                    regimenFiscalId: businessToEdit.regimenFiscalId || businessToEdit.RegimenFiscalId || ''
                });
                setLogoPreview(existingLogo);
            } else {
                setFormData(initialFormState);
                setLogoPreview(null);
            }
        }
    }, [isOpen, businessToEdit]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            setLogoFile(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.regimenFiscalId) {
            toast.error("⚠️ Selecciona un Régimen Fiscal.");
            return;
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
             toast.error("⚠️ El teléfono debe tener 10 dígitos numéricos.");
             return; 
        }
        onSubmit({ ...formData, logoFile });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* 1. BACKDROP */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* 2. MODAL (Fondo Blanco Explícito) */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {businessToEdit ? 'Editar Negocio' : 'Registrar Negocio'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            
                            {/* LOGO */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group cursor-pointer w-32 h-32" onClick={() => fileInputRef.current.click()}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full rounded-xl object-contain border-4 border-pink-100 shadow-sm bg-white" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                                            <Building size={32} />
                                            <span className="text-xs mt-1">Subir Logo</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.legalName} onChange={e => setFormData({...formData, legalName: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none uppercase transition-all" value={formData.rfc} onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase()})} maxLength={13} />
                                    </div>
                                </div>

                                {/* REGIMEN FISCAL (ANIMATED) */}
                                <div>
                                    <AnimatedSelect
                                        label="Régimen Fiscal"
                                        options={regimenes}
                                        value={formData.regimenFiscalId}
                                        onChange={(val) => setFormData({ ...formData, regimenFiscalId: val })}
                                        icon={FileText}
                                        placeholder="Seleccionar..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="tel" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.phoneNumber} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({...formData, phoneNumber: val}); }} maxLength={10} placeholder="Ej. 8123456789" />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} maxLength={5} />
                                    </div>
                                </div>

                                {/* MONEDA (ANIMATED) */}
                                <div>
                                    <AnimatedSelect
                                        label="Moneda"
                                        options={currencyOptions}
                                        value={formData.currencyType}
                                        onChange={(val) => setFormData({ ...formData, currencyType: val })}
                                        icon={Globe}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="pt-2 flex gap-3 justify-end border-t border-gray-50">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-all">
                                    {businessToEdit ? <><RefreshCw size={18} /> Actualizar Negocio</> : <><Save size={18} /> Guardar Negocio</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default BusinessModal;