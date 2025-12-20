import React from 'react';
import { X, Calendar, User, FileText, Hash, DollarSign, Tag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- VARIANTES DE ANIMACIÓN (Bounce / Rebote) ---
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: {
        scale: 0.8,
        opacity: 0,
        y: 20
    },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20, // Controla el "rebote"
            mass: 0.8
        }
    },
    exit: {
        scale: 0.9,
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 }
    }
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* MODAL */}
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >

                        {/* Header con Gradiente Sutil */}
                        <div className="flex justify-between items-start p-6 pb-4 bg-gradient-to-r from-pink-50 to-white border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                                    <span className="bg-pink-100 text-pink-600 p-2 rounded-xl">
                                        <FileText size={24} />
                                    </span>
                                    Detalle de Venta
                                </h2>
                                <span className="text-sm text-gray-400 font-mono mt-2 ml-1 block">
                                    Folio: <span className="text-gray-600 font-bold">{sale.saleNumber}</span>
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenido Scrollable */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">

                            {/* Tarjetas de Información */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {/* Cliente */}
                                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                                        <User size={12} /> Cliente
                                    </p>
                                    <p className="font-bold text-gray-800 text-sm md:text-base">
                                        {sale.clientName || "Público General"}
                                    </p>
                                </div>
                                {/* Fecha */}
                                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                                        <Calendar size={12} /> Fecha de Registro
                                    </p>
                                    <p className="font-bold text-gray-800 text-sm md:text-base capitalize">
                                        {formatDate(sale.registrationDate)}
                                    </p>
                                </div>
                                {/* Documento */}
                                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                                        <Hash size={12} /> Tipo Documento
                                    </p>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${sale.documentType === 'Factura'
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                        {sale.documentType || "Ticket"}
                                    </span>
                                </div>
                            </div>

                            {/* Tabla de Productos */}
                            <h3 className="text-sm font-extrabold text-gray-800 mb-4 pl-1 flex items-center gap-2">
                                <Package size={16} className="text-pink-500" /> Productos Vendidos
                            </h3>

                            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 font-bold">Producto</th>
                                            <th className="p-4 text-center font-bold">Cant.</th>
                                            <th className="p-4 text-right font-bold">Precio Unitario</th>
                                            <th className="p-4 text-right font-bold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sale.details && sale.details.map((item, index) => (
                                            <tr key={index} className="hover:bg-pink-50/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-700">{item.productName}</div>
                                                    {/* Opcional: Si el backend enviara info extra, aquí iría */}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold text-xs">
                                                        x{item.quantity}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right text-gray-600 font-medium">
                                                    ${item.unitPrice?.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-right font-extrabold text-gray-800">
                                                    ${item.total?.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Sección Totales (Diseño Ticket) */}
                            <div className="flex justify-end">
                                <div className="w-full md:w-80 bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-bold text-gray-700">${sale.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span className="font-medium">Impuestos (16%)</span>
                                        <span className="font-bold text-gray-700">${sale.tax?.toFixed(2)}</span>
                                    </div>

                                    <div className="h-px bg-gray-200 my-2 border-dashed border-t border-gray-300"></div>

                                    <div className="flex justify-between items-end">
                                        <span className="text-base font-bold text-gray-800">Total Pagado</span>
                                        <span className="text-2xl font-extrabold text-pink-600">
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