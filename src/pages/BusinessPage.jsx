import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Importamos para animaciones
import PageHeader from '../components/common/PageHeader';
import BusinessModal from '../components/business/BusinessModal';
import { businessService } from '../services/businessService';
import { MapPin, Phone, Mail, FileText, Store, Plus, RefreshCw, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

// Variantes de animación consistentes
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

function BusinessPage() {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadBusiness = async () => {
        try {
            setLoading(true);
            const data = await businessService.getBusiness();
            if (Array.isArray(data) && data.length > 0) {
                setBusiness(data[0]);
            } else {
                setBusiness(null);
            }
        } catch (error) {
            console.warn("No se encontró información del negocio o error al cargar");
            setBusiness(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBusiness(); }, []);

    const handleSave = async (formData) => {
        const toastId = toast.loading(business ? "Actualizando..." : "Registrando...");
        try {
            if (business) {
                await businessService.update(business.id || business.Id, formData);
                toast.success("Información actualizada", { id: toastId });
            } else {
                await businessService.create(formData);
                toast.success("Negocio registrado con éxito", { id: toastId });
            }
            setIsModalOpen(false);
            loadBusiness();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const getImageUrl = (rawImage) => {
        if (!rawImage) return null;
        if (!rawImage.includes('/') && rawImage.length > 100) return `data:image/png;base64,${rawImage}`;
        if (rawImage.includes("Uploads") || rawImage.includes("/")) {
            const cleanPath = rawImage.replace(/\\/g, '/');
            const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
            return `${API_BASE_URL}/${pathPart}`;
        }
        return rawImage;
    };

    const renderLogo = () => {
        const src = getImageUrl(business?.logo || business?.Logo);
        if (src) {
            const cacheBuster = src.startsWith('http') ? `?t=${new Date().getTime()}` : '';
            return (
                <img
                    src={`${src}${cacheBuster}`}
                    alt="Logo"
                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-md object-contain bg-white"
                />
            );
        }
        return (
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-md flex items-center justify-center text-pink-500">
                <Store size={64} strokeWidth={1.5} />
            </div>
        );
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#F9FAFB] text-pink-500 font-montserrat">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
    );

    return (
        // 1. WRAPPER PRINCIPAL (Full Width + Fondo Gris)
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            
            {/* 2. HEADER FULL WIDTH */}
            <div className="flex-shrink-0">
                <PageHeader title="Información del Negocio" />
            </div>

            {/* 3. CONTENIDO PRINCIPAL (Centrado y limitado) */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    {!business ? (
                        // --- ESTADO VACÍO (Centrado visualmente en pantalla) ---
                        <div className="min-h-[60vh] flex flex-col items-center justify-center">
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center max-w-2xl w-full">
                                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-pink-500">
                                    <Store size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configura tu Negocio</h2>
                                <p className="text-gray-500 mb-8 max-w-md">
                                    Registra la información fiscal y general de tu empresa para que aparezca correctamente en tus tickets y facturas.
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold shadow-xl shadow-pink-200 transition-all active:scale-95"
                                >
                                    <Plus size={20} /> Registrar Negocio
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- VISTA DETALLE ---
                        // Usamos max-w-5xl para que la info no se estire demasiado en pantallas 1600px
                        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            {/* Banner Fondo */}
                            <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-40 relative"></div>

                            <div className="px-8 md:px-12 pb-12">
                                {/* Header con Logo Superpuesto */}
                                <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row justify-between items-end gap-6">
                                    <div className="flex items-end gap-6">
                                        {renderLogo()}
                                        <div className="mb-2">
                                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                                                {business.legalName || business.LegalName}
                                            </h2>
                                            <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-lg w-fit mt-2">
                                                <FileText size={16} className="text-pink-500" />
                                                <span>RFC: <span className="text-gray-700 font-bold">{business.rfc || business.Rfc}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setIsModalOpen(true)} 
                                        className="bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 hover:text-pink-600 hover:border-pink-200 transition-all shadow-sm flex items-center gap-2 mb-2"
                                    >
                                        <RefreshCw size={18} /> Editar Información
                                    </button>
                                </div>

                                {/* Grid de Información */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                                    {/* Columna Izquierda */}
                                    <div className="space-y-8">
                                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                                            <MapPin size={20} className="text-pink-500"/> Ubicación y Contacto
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="group">
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Dirección Fiscal</p>
                                                <p className="text-gray-700 font-medium text-lg leading-snug group-hover:text-pink-600 transition-colors">
                                                    {business.address || business.Address}
                                                </p>
                                                <span className="inline-block mt-1 text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                                                    C.P. {business.postalCode || business.PostalCode}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Correo Electrónico</p>
                                                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                        <Mail size={16} className="text-gray-400" />
                                                        {business.email || business.Email}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Teléfono</p>
                                                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                        <Phone size={16} className="text-gray-400" />
                                                        {business.phoneNumber || business.PhoneNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna Derecha */}
                                    <div className="space-y-8">
                                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                                            <FileText size={20} className="text-pink-500"/> Datos Fiscales
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">Régimen Fiscal</p>
                                                <p className="text-gray-800 font-bold text-xl leading-tight">
                                                    {business.regimenFiscalDescription || "No especificado"}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400">CLAVE:</span>
                                                    <span className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 font-mono font-bold">
                                                        {business.regimenFiscalId || business.RegimenFiscalId}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Moneda Base</p>
                                                    <p className="text-gray-800 font-bold text-lg">{business.currencyType || business.CurrencyType}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-pink-200 shadow-sm">
                                                    <Globe size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            <BusinessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                businessToEdit={business}
            />
        </div>
    );
}

export default BusinessPage;