import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { orderService } from '../../services/orderService';

const OrderDetailModal = ({ isOpen, orderId, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            setLoading(true);
            orderService.getById(orderId)
                .then(data => setDetail(data))
                .finally(() => setLoading(false));
        }
    }, [isOpen, orderId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1,
                            transition: { type: "spring", stiffness: 300, damping: 15 } // Efecto rebote solicitado
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
                    >
                        {/* HEADER */}
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Detalle de Insumos</h2>
                                <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mt-1">
                                    ORDEN #{detail?.orderNumber}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 text-gray-400 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* LISTA DE PRODUCTOS */}
                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-[2rem]" />)}
                                </div>
                            ) : (
                                detail?.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50/50 rounded-[2.2rem] border border-white shadow-sm">
                                        
                                        {/* CANTIDAD (Círculo Rosa Corregido) */}
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-pink-500 font-black text-lg shadow-sm border border-gray-100 shrink-0">
                                            {item.quantity} 
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 text-[15px] truncate">{item.productName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] font-bold text-gray-400">Unit: ${item.unitPrice?.toFixed(2)}</p>
                                                {/* Descuento por unidad del payload */}
                                                {item.discountPerUnit > 0 && (
                                                    <p className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                                        (-${item.discountPerUnit.toFixed(2)})
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            {/* Total neto por línea */}
                                            <p className="font-black text-gray-900 font-mono text-lg">${item.total?.toFixed(2)}</p>
                                            {/* Ahorro total por línea del payload */}
                                            {item.discountTotal > 0 && (
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                                    AHORRO: ${item.discountTotal.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* FOOTER TOTAL */}
                        <div className="p-8 bg-pink-50/30 border-t border-pink-100 flex justify-between items-center">
                            <div>
                                <span className="text-[11px] font-black text-pink-500 uppercase tracking-widest block">Total Final</span>
                                {detail?.totalSavings > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-600">Ahorro Total: ${detail.totalSavings.toFixed(2)}</span>
                                )}
                            </div>
                            <span className="text-4xl font-black text-gray-900 tracking-tighter font-mono">
                                ${detail?.total?.toFixed(2)}
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailModal;