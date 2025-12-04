import React, { useState, useEffect } from 'react';
import { X, Save, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

function CategoryModal({ isOpen, onClose, onSubmit, categoryToEdit }) {
    const initialFormState = {
        description: '',
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (categoryToEdit) {
                // Modo Edición: Normalizamos nombres (PascalCase o camelCase)
                setFormData({
                    description: categoryToEdit.description || categoryToEdit.Description || '',
                    isActive: categoryToEdit.isActive !== undefined ? categoryToEdit.isActive : categoryToEdit.IsActive
                });
            } else {
                // Modo Crear
                setFormData(initialFormState);
            }
        }
    }, [isOpen, categoryToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
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
                    
                    {/* Campo Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <div className="relative">
                            <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                required 
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                placeholder="Ej. Bebidas, Electrónica..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Toggle Estado (Solo visible al editar para consistencia, o siempre si prefieres) */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Estado</span>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                                formData.isActive 
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
                    <div className="pt-2 flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium shadow-sm active:scale-95 transition-all">
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CategoryModal;