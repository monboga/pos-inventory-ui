import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, FileText, Briefcase, RefreshCw } from 'lucide-react';
import { satService } from '../../services/satService'; 

function CustomerModal({ isOpen, onClose, onSubmit, clientToEdit }) {
    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        rfc: '',
        regimenFiscalId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [regimenes, setRegimenes] = useState([]);
    
    // 1. Cargar Catálogo SAT al abrir
    useEffect(() => {
        if (isOpen) {
            const loadSatData = async () => {
                const data = await satService.getRegimenesFiscales(); 
                setRegimenes(data);
            };
            loadSatData();
        }
    }, [isOpen]);

    // 2. Cargar Datos al Editar
    useEffect(() => {
        if (isOpen) {
            if (clientToEdit) {
                // FIX: El backend manda 'fullName', así que lo separamos para editar
                // Si el backend en el futuro manda firstName/lastName separados, esto se puede simplificar.
                const fullName = clientToEdit.fullName || clientToEdit.FullName || "";
                const parts = fullName.split(' ');
                
                // Estrategia simple: Primera palabra es nombre, el resto apellido
                const fName = parts[0] || "";
                const lName = parts.slice(1).join(' ') || "";

                setFormData({
                    // Usamos los valores calculados o los directos si existieran
                    firstName: clientToEdit.firstName || fName,
                    lastName: clientToEdit.lastName || lName,
                    email: clientToEdit.email || clientToEdit.Email || '',
                    rfc: clientToEdit.rfc || clientToEdit.Rfc || '',
                    // Importante: Asegurarnos de leer el ID del régimen
                    regimenFiscalId: clientToEdit.regimenFiscalId || clientToEdit.RegimenFiscalId || ''
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, clientToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validación simple
        if (!formData.regimenFiscalId) {
            alert("Debes seleccionar un Régimen Fiscal");
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Ej. Ana"
                                    value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido(s)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Ej. García"
                                    value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="cliente@empresa.com"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><FileText size={16}/> Datos Fiscales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RFC</label>
                                <input type="text" required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none uppercase font-mono" placeholder="XAXX010101000" maxLength={13}
                                    value={formData.rfc} onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase()})} />
                            </div>
                            
                            {/* FIX DROPDOWN: Usamos 'code' y 'description' según JSON SAT */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Régimen Fiscal</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select required className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white appearance-none text-sm"
                                        value={formData.regimenFiscalId} onChange={e => setFormData({...formData, regimenFiscalId: e.target.value})}>
                                        <option value="">Seleccionar...</option>
                                        {regimenes.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.code} - {r.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Texto Dinámico */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium shadow-sm active:scale-95 transition-all">
                            {clientToEdit ? (
                                <><RefreshCw size={18} /> Actualizar Cliente</>
                            ) : (
                                <><Save size={18} /> Guardar Cliente</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerModal;