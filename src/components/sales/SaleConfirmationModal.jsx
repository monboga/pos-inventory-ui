import React from 'react';
import { X, FileText, Receipt } from 'lucide-react';

function SaleConfirmationModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 transform scale-100 transition-all">
                
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmar Venta</h2>
                    <p className="text-gray-500 mb-6">¿Deseas generar factura para esta venta?</p>

                    <div className="space-y-3">
                        {/* Opción SI (Placeholder por ahora) */}
                        <button 
                            onClick={() => alert("Funcionalidad de Facturación (Timbrado) pendiente de implementación.")}
                            className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200 flex items-center justify-center gap-2 transition-colors"
                        >
                            <FileText size={20} /> Sí, Facturar
                        </button>

                        {/* Opción NO (Generar Ticket) */}
                        <button 
                            onClick={() => onConfirm('Ticket')}
                            className="w-full py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Receipt size={20} /> No, solo Ticket
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SaleConfirmationModal;