import React, { useState } from 'react';
import { X, Save, Layout } from 'lucide-react';

function SaveViewModal({ isOpen, onClose, onSave }) {
    const [viewName, setViewName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!viewName.trim()) return;
        
        onSave(viewName);
        setViewName(""); // Limpiar input
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Layout size={20} className="text-pink-500" />
                        Guardar Vista Actual
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la vista
                        </label>
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Ej. Usuarios Activos, Búsqueda de Juan..." 
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                            value={viewName}
                            onChange={(e) => setViewName(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Se guardarán los filtros de búsqueda y configuración actuales.
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={!viewName.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SaveViewModal;