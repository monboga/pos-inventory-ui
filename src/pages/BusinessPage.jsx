import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import BusinessModal from '../components/business/BusinessModal';
import { businessService } from '../services/businessService';
import { Building, MapPin, Phone, Mail, FileText, Store, Plus, RefreshCw, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://localhost:7031';

function BusinessPage() {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadBusiness = async () => {
        try {
            setLoading(true);
            const data = await businessService.getBusiness();
            // La API devuelve un array, tomamos el primero si existe
            if (Array.isArray(data) && data.length > 0) {
                setBusiness(data[0]);
            } else {
                setBusiness(null);
            }
        } catch (error) {
            // Si da 404 o error, asumimos que no hay config
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
            loadBusiness(); // Recargar datos
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
            // Agregamos un timestamp para evitar caché del navegador al actualizar
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

    if (loading) return <div className="p-8">Cargando información...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <PageHeader title="Información del Negocio" />

            {!business ? (
                // --- ESTADO VACÍO (NO HAY NEGOCIO) ---
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-pink-500">
                        <Store size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Aún no has configurado tu negocio</h2>
                    <p className="text-gray-500 mb-8 max-w-md">Registra la información fiscal y general de tu empresa para que aparezca en tus tickets y facturas.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Registrar Negocio
                    </button>
                </div>
            ) : (
                // --- VISTA DETALLE (EXISTE NEGOCIO) ---
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                    {/* Banner Fondo */}
                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-32 relative"></div>

                    <div className="px-8 pb-8">
                        {/* Header con Logo Superpuesto */}
                        <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row justify-between items-end gap-4">
                            <div className="flex items-end gap-6">
                                {renderLogo()}
                                <div className="mb-2">
                                    <h2 className="text-3xl font-bold text-gray-800">{business.legalName || business.LegalName}</h2>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <FileText size={16} className="text-pink-500" />
                                        <span>RFC: {business.rfc || business.Rfc}</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setIsModalOpen(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 hover:text-pink-600 transition-colors shadow-sm flex items-center gap-2">
                                <RefreshCw size={18} /> Editar Información
                            </button>
                        </div>

                        {/* Grid de Información */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                            {/* Columna Izquierda */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Ubicación y Contacto</h3>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Dirección</p>
                                        <p className="text-gray-700 font-medium">{business.address || business.Address}</p>
                                        <p className="text-gray-500 text-sm">C.P. {business.postalCode || business.PostalCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Correo Electrónico</p>
                                        <p className="text-gray-700 font-medium">{business.email || business.Email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Phone size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Teléfono</p>
                                        <p className="text-gray-700 font-medium">{business.phoneNumber || business.PhoneNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Datos Fiscales</h3>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Régimen Fiscal</p>
                                    <p className="text-gray-800 font-bold text-lg">
                                        {business.regimenFiscalDescription || "No especificado"}
                                    </p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-500 font-mono">
                                        ID: {business.regimenFiscalId || business.RegimenFiscalId}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Moneda</p>
                                        <p className="text-gray-800 font-bold">{business.currencyType || business.CurrencyType}</p>
                                    </div>
                                    <Globe className="text-gray-300" size={32} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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