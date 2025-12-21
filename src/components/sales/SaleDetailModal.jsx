import React from 'react';
import { X, Calendar, User, FileText, Hash, Package, Layers, Percent, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- VARIANTES DE ANIMACIÓN ---
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { 
        scale: 1, opacity: 1, y: 0,
        transition: { type: "spring", stiffness: 350, damping: 25 }
    },
    exit: { scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.15 } }
};

function SaleDetailModal({ isOpen, onClose, sale }) {
    
    // Formateo de fecha
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('es-MX', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && sale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    {/* BACKDROP */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose}
                    />

                    {/* MODAL */}
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
                        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-start p-6 pb-4 bg-white border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                    <div className="bg-pink-100 text-pink-600 p-2.5 rounded-xl">
                                        <FileText size={24} strokeWidth={2.5}/>
                                    </div>
                                    Detalle de Venta
                                </h2>
                                <p className="text-sm text-gray-400 font-medium mt-1 ml-1 flex items-center gap-2">
                                    Folio <span className="text-gray-800 font-bold bg-gray-100 px-2 py-0.5 rounded text-xs">{sale.saleNumber}</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full transition-all active:scale-95">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* BODY SCROLLABLE */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">

                            {/* INFO CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><User size={12} /> Cliente</p>
                                    <p className="font-bold text-gray-800 text-sm">{sale.clientName || "Público General"}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={12} /> Fecha</p>
                                    <p className="font-bold text-gray-800 text-sm capitalize">{formatDate(sale.registrationDate)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Hash size={12} /> Documento</p>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold border ${sale.documentType === 'Factura' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {sale.documentType || "Ticket"}
                                    </span>
                                </div>
                            </div>

                            {/* TABLA DE PRODUCTOS */}
                            <div className="mb-8">
                                <h3 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                    <Package size={16} className="text-pink-500" /> Productos Vendidos
                                </h3>
                                
                                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-xs border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 pl-6">Descripción</th>
                                                <th className="p-4 text-center">Cant.</th>
                                                <th className="p-4 text-right">Precio Unit.</th>
                                                <th className="p-4 pr-6 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {sale.details && sale.details.map((item, index) => {
                                                // LÓGICA DE DESCUENTO
                                                const discountAmount = item.discountAmount || 0;
                                                const hasDiscount = discountAmount > 0;
                                                
                                                // NOTA: Para distinguir colores, el backend debería enviar 'isBulkDiscount'.
                                                // Si no existe, por defecto usamos Rosa (Oferta).
                                                const isBulk = item.isBulkDiscount === true; 
                                                const themeColor = isBulk ? 'blue' : 'pink';
                                                
                                                // Cálculos inversos para mostrar info (basado en lógica de BD)
                                                // item.unitPrice es el precio ORIGINAL.
                                                // item.total es el precio FINAL PAGADO.
                                                // finalUnitPrice es lo que realmente costó cada unidad.
                                                const finalUnitPrice = item.quantity > 0 ? (item.total / item.quantity) : 0;

                                                return (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="p-4 pl-6">
                                                            <div className="font-bold text-gray-700 mb-0.5">{item.productName}</div>
                                                            {hasDiscount && (
                                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${isBulk ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-pink-50 text-pink-600 border-pink-100'}`}>
                                                                    {isBulk ? <Layers size={8}/> : <Percent size={8}/>}
                                                                    {isBulk ? 'Precio Mayoreo' : 'Oferta Aplicada'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                                                                x{item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {hasDiscount ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[10px] text-gray-400 line-through decoration-gray-300">
                                                                        ${item.unitPrice?.toFixed(2)}
                                                                    </span>
                                                                    <span className={`font-bold text-xs ${isBulk ? 'text-blue-600' : 'text-pink-600'}`}>
                                                                        ${finalUnitPrice.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="font-medium text-gray-600">${item.unitPrice?.toFixed(2)}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 pr-6 text-right">
                                                            <div className="font-bold text-gray-800">${item.total?.toFixed(2)}</div>
                                                            {hasDiscount && (
                                                                <div className="text-[9px] font-bold text-green-600 flex items-center justify-end gap-0.5">
                                                                    <Sparkles size={8} /> Ahorro: ${discountAmount.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* TOTALES */}
                            <div className="flex justify-end">
                                <div className="w-full sm:w-72 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-bold text-gray-700">${sale.subtotal?.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Mostrar Descuento Global si existe */}
                                    {sale.totalDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600 animate-pulse-slow">
                                            <span className="font-bold flex items-center gap-1"><Sparkles size={12}/> Ahorro Total</span>
                                            <span className="font-bold">-${sale.totalDiscount?.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span className="font-medium">Impuestos (16%)</span>
                                        <span className="font-bold text-gray-700">${sale.tax?.toFixed(2)}</span>
                                    </div>

                                    <div className="h-px bg-gray-200 my-2 border-dashed border-t border-gray-300"></div>

                                    <div className="flex justify-between items-end">
                                        <span className="text-base font-bold text-gray-800">Total Pagado</span>
                                        <span className="text-2xl font-black text-pink-600 tracking-tight">
                                            ${sale.total?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default SaleDetailModal;