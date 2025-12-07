import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

function DateRangeModal({ isOpen, onClose, onApply }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(startDate, endDate);
        onClose();
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onApply(null, null); // Limpiar filtro
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calendar size={20} className="text-pink-500" /> Filtrar por Fecha
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Inicio</label>
                        <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Fin</label>
                        <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={handleClear} className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            Limpiar
                        </button>
                        <button type="submit" className="flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2">
                            <Check size={16} /> Aplicar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DateRangeModal;