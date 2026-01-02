import { motion } from 'framer-motion';
import { X, Upload, Trash2, Image as ImageIcon, Save, MapPin, Building2, FileText, Globe } from 'lucide-react';
import AnimatedSelect from '../common/AnimatedSelect';
import { useBusinessCatalogs } from '../../hooks/business/useBusinessCatalogs';
import { useBusinessForm } from '../../hooks/business/useBusinessForm';

const BusinessModal = ({ isOpen, onClose, onSubmit, businessToEdit }) => {
    const { regimenOptions, currencyOptions, loading: loadingCatalogs } = useBusinessCatalogs(isOpen);
    
    const {
        formData, previewLogo, fileInputRef,
        handleChange, handleSelectChange, handleFileChange, handleRemoveLogo, handleSubmit
    } = useBusinessForm(businessToEdit, isOpen, onSubmit);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm font-montserrat">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">
                            {businessToEdit ? 'Editar Negocio' : 'Registrar Nuevo Negocio'}
                        </h2>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Completa la información fiscal y comercial</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-8 custom-scrollbar bg-[#F9FAFB]">
                    <form id="business-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* IDENTIDAD */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2"><Building2 size={18} className="text-pink-500" /> Identidad Visual</h3>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex flex-col items-center gap-3 w-full md:w-1/3">
                                    <div onClick={() => fileInputRef.current.click()} className={`relative w-48 h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${previewLogo ? 'border-pink-300 bg-white' : 'border-gray-300 bg-gray-50 hover:bg-pink-50 hover:border-pink-300'}`}>
                                        {previewLogo ? <><img src={previewLogo} alt="Preview" className="w-full h-full object-contain p-4" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white font-bold text-sm flex items-center gap-2"><Upload size={16}/> Cambiar</span></div></> : <div className="text-center p-4"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 text-pink-300 group-hover:text-pink-500"><ImageIcon size={24} /></div><p className="text-xs font-bold text-gray-400 group-hover:text-pink-500">Subir Logotipo</p></div>}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    {previewLogo && <button type="button" onClick={handleRemoveLogo} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline"><Trash2 size={12}/> Eliminar</button>}
                                </div>
                                <div className="flex-1 space-y-5">
                                    <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Razón Social <span className="text-pink-500">*</span></label><input required name="legalName" value={formData.legalName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" placeholder="Razón Social" /></div>
                                    <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Nombre Comercial</label><input name="commercialName" value={formData.commercialName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" placeholder="Nombre Comercial" /></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">RFC <span className="text-pink-500">*</span></label><input required name="rfc" value={formData.rfc} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium uppercase" placeholder="RFC" /></div>
                                        <div className="relative z-20"><AnimatedSelect label="Moneda Base" options={currencyOptions} value={formData.currencyTypeId} onChange={(val) => handleSelectChange('currencyTypeId', val)} icon={Globe} disabled={loadingCatalogs} placeholder="Selecciona moneda" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UBICACIÓN */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2"><MapPin size={18} className="text-pink-500" /> Ubicación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Calle</label><input name="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">No. Exterior</label><input name="externalNumber" value={formData.externalNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Colonia</label><input name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">C.P.</label><input name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Ciudad</label><input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Estado</label><input name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">País</label><input name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Teléfono</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none text-sm font-medium" /></div>
                            </div>
                        </div>

                        {/* FISCAL */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2"><FileText size={18} className="text-pink-500" /> Configuración Fiscal</h3>
                            <AnimatedSelect label="Régimen Fiscal" options={regimenOptions} value={formData.regimenFiscalId} onChange={(val) => handleSelectChange('regimenFiscalId', val)} icon={FileText} disabled={loadingCatalogs} placeholder="Selecciona un régimen..." />
                        </div>
                    </form>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" form="business-form" className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all active:scale-95"><Save size={18} /> Guardar Cambios</button>
                </div>
            </motion.div>
        </div>
    );
};

export default BusinessModal;