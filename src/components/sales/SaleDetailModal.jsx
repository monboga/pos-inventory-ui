import React from 'react';
import { X, Calendar, User, FileText, Hash, DollarSign } from 'lucide-react';

function SaleDetailModal({ isOpen, onClose, sale }) {
    if (!isOpen || !sale) return null;

    // Formateo de fecha
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('es-MX', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={20} className="text-pink-500"/> 
                            Detalle de Venta
                        </h2>
                        <span className="text-xs text-gray-500 font-mono mt-1 block">
                            Folio: {sale.saleNumber}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Contenido Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Información General */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><User size={12}/> Cliente</p>
                            <p className="font-semibold text-gray-800">{sale.clientName || "Público General"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Calendar size={12}/> Fecha</p>
                            <p className="font-semibold text-gray-800">{formatDate(sale.registrationDate)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Hash size={12}/> Documento</p>
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                                {sale.documentType || "Ticket"}
                            </span>
                        </div>
                    </div>

                    {/* Tabla de Productos */}
                    <h3 className="text-sm font-bold text-gray-800 mb-3 pl-1">Productos Vendidos</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-3">Producto</th>
                                    <th className="p-3 text-center">Cantidad</th>
                                    <th className="p-3 text-right">Precio por Unidad</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sale.details && sale.details.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50">
                                        <td className="p-3 font-medium text-gray-700">{item.productName}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right text-gray-600">${item.unitPrice?.toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold text-gray-800">${item.total?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totales */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${sale.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Impuestos</span>
                                <span>${sale.tax?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                                <span>TOTAL</span>
                                <span className="text-pink-600">${sale.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SaleDetailModal;