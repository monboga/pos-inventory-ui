import React from 'react';
import { Mail, Shield, Edit2, XCircle, Save } from 'lucide-react';
import ProfileInput from '../common/ProfileInput';
import { useEditMode } from '../../hooks/common/useEditMode';

function PersonalTab({ formData, setFormData, onUpdateProfile, isLoading }) {
    // Usamos nuestro nuevo hook
    const { isEditing, startEditing, cancelEditing, stopEditing, hasChanges } = useEditMode(formData, setFormData);

    const handleSubmit = async (e) => {
        // Envolvemos el submit para cerrar la edición si tiene éxito
        try {
            await onUpdateProfile(e);
            stopEditing();
        } catch (error) {
            // Si falla, mantenemos el modo edición
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
                    <p className="text-sm text-gray-400 mt-1">Actualiza tus datos básicos y de contacto.</p>
                </div>
                {!isEditing && (
                    <button type="button" onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors font-medium text-sm active:scale-95">
                        <Edit2 size={16} /> Editar
                    </button>
                )}
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileInput label="Nombre" value={formData.firstName} disabled={!isEditing} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <ProfileInput label="Apellido" value={formData.lastName} disabled={!isEditing} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>

            <ProfileInput label="Correo Electrónico" type="email" value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({ ...formData, email: e.target.value })} icon={Mail} />

            {/* Banner Read-only */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                <Shield className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="text-sm font-bold text-blue-800">Cuenta Verificada</p>
                    <p className="text-xs text-blue-600 mt-0.5">Tu rol actual es <strong>{formData.role}</strong>.</p>
                </div>
            </div>

            {/* Footer Actions */}
            {isEditing && (
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-2">
                    <button type="button" onClick={cancelEditing} disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors">
                        <XCircle size={18} /> Cancelar
                    </button>
                    <button type="submit" disabled={isLoading || !hasChanges} className="flex items-center gap-2 px-8 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                    </button>
                </div>
            )}
        </form>
    );
}

export default PersonalTab;