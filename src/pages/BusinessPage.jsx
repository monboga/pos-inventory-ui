import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, Phone, Mail, FileText, Plus, Edit3, Globe, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Componentes
import PageHeader from '../components/common/PageHeader';
import BusinessModal from '../components/business/BusinessModal';
import BusinessCardSection from '../components/business/BusinessCardSection'; // <--- NUEVO
import BusinessInformationItem from '../components/business/BusinessInformationItem'; // <--- NUEVO

// Hooks y Servicios
import { useBusinessData } from '../hooks/business/useBusinessData';
import { businessService } from '../services/businessService';

function BusinessPage() {
    // 1. Hook de Lectura (Obtiene datos formateados)
    const { 
        business, 
        loading, 
        refreshBusiness, 
        logoUrl, 
        fullAddress, 
        fullLocation 
    } = useBusinessData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Lógica de Guardado (Orquestación)
    // Se mantiene aquí porque la página debe actualizarse tras el guardado
    const handleSave = async (formData) => {
        const toastId = toast.loading(business ? "Actualizando..." : "Registrando...");
        try {
            if (business) {
                await businessService.update(business.id, formData);
                toast.success("Información actualizada", { id: toastId });
            } else {
                await businessService.create(formData);
                toast.success("Negocio registrado", { id: toastId });
            }
            setIsModalOpen(false);
            refreshBusiness(); // Recargar datos para ver cambios
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar información", { id: toastId });
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#F9FAFB] text-pink-500 font-montserrat">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            <div className="flex-shrink-0">
                <PageHeader title="Mi Negocio" />
            </div>

            <div className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
                <AnimatePresence mode="wait">
                    {!business ? (
                        /* --- EMPTY STATE --- */
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] border-2 border-dashed border-pink-200 p-12 flex flex-col items-center justify-center text-center shadow-sm max-w-2xl mx-auto mt-10"
                        >
                            <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mb-6 relative group">
                                <div className="absolute inset-0 bg-pink-200 rounded-full opacity-20 animate-ping group-hover:animate-none"></div>
                                <Store size={64} className="text-pink-500 relative z-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Comencemos a configurar tu negocio</h2>
                            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                                Registra tu información fiscal y ubicación para comenzar.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg shadow-pink-200 transition-all"
                            >
                                <Plus size={20} /> Registrar mi Negocio
                            </button>
                        </motion.div>
                    ) : (
                        /* --- BUSINESS INFO STATE --- */
                        <div key="content" className="space-y-8 max-w-6xl mx-auto">
                            
                            {/* 1. SECCIÓN PRINCIPAL (Identidad) */}
                            <BusinessCardSection className="relative pt-0" delay={0.1}>
                                <div className="h-32 bg-gradient-to-r from-pink-600 to-pink-400">
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Activo
                                    </div>
                                </div>
                                <div className="px-8 pb-8 flex flex-col md:flex-row gap-6">
                                    <div className="-mt-12 shrink-0 relative">
                                        <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <Store size={48} className="text-pink-300" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{business.legalName}</h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-sm font-bold border border-pink-200">
                                                    {business.rfc}
                                                </span>
                                                {business.commercialName && (
                                                    <span className="text-gray-400 text-sm font-medium border-l border-gray-300 pl-2 flex items-center gap-1">
                                                        <Store size={12}/> {business.commercialName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-pink-100 text-pink-600 font-bold rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-colors shadow-sm"
                                        >
                                            <Edit3 size={18} /> <span>Editar Información</span>
                                        </button>
                                    </div>
                                </div>
                            </BusinessCardSection>

                            {/* 2. GRID DE DETALLES */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Columna Izquierda: Ubicación y Contacto */}
                                <BusinessCardSection delay={0.2} className="p-6 h-full">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                            <Building2 size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Ubicación y Contacto</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <BusinessInformationItem 
                                            icon={MapPin} 
                                            label="Dirección Fiscal" 
                                            value={`${fullAddress} \n ${fullLocation}`} 
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <BusinessInformationItem icon={Phone} label="Teléfono" value={business.phoneNumber} />
                                            <BusinessInformationItem icon={Mail} label="Email" value={business.email} />
                                        </div>
                                    </div>
                                </BusinessCardSection>

                                {/* Columna Derecha: Fiscal */}
                                <BusinessCardSection delay={0.3} className="p-6 h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                            <FileText size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Configuración Fiscal</h3>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Card Régimen (Diseño especial inline, o podrías hacer un componente extra si reutilizas) */}
                                        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-pink-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Régimen Fiscal</p>
                                            <p className="text-gray-800 font-bold text-lg pr-4 leading-tight">
                                                {business.regimenFiscalDescription || "No especificado"}
                                            </p>
                                            <div className="mt-3 inline-flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                <span className="text-xs font-mono text-gray-500 font-bold">ID: {business.regimenFiscalId}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <BusinessInformationItem 
                                                icon={Globe} 
                                                label="Moneda" 
                                                value={business.currencyCode || business.currencyType} 
                                            />
                                            <BusinessInformationItem 
                                                icon={CreditCard} 
                                                label="Pagos" 
                                                value="Habilitados" 
                                            />
                                        </div>
                                    </div>
                                </BusinessCardSection>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

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