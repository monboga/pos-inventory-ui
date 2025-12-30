import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MapPin } from 'lucide-react';

const OrderSuccessModal = ({ 
    isOpen, 
    orderData, 
    onNewOrder, 
    onTrackOrder 
}) => {
    // Si no hay datos, no mostramos nada (seguridad)
    if (!orderData) return null;

    const items = orderData.items || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-gray-900/80 backdrop-blur-md" 
                    />
                    
                    {/* Card del Modal */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white w-full max-w-sm rounded-[2.5rem] relative z-20 overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center"
                    >
                        {/* --- ANIMACIÓN DEL CHECK --- */}
                        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-full h-full absolute bg-pink-100 rounded-full opacity-50 animate-pulse"
                            />
                            <svg viewBox="0 0 24 24" className="w-12 h-12 text-pink-500 stroke-[3px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <motion.path
                                    d="M20 6L9 17l-5-5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">
                            ¡Pedido Recibido!
                        </h2>
                        <p className="text-gray-400 font-medium text-sm mb-6">
                            Tu orden ha sido registrada correctamente.
                        </p>

                        {/* --- DETALLES DE LA ORDEN --- */}
                        <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 text-left relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-gray-100" />
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 border-dashed">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nº Orden</span>
                                <span className="font-mono font-bold text-gray-900 text-lg">#{orderData.orderNumber}</span>
                            </div>

                            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-1 mb-3">
                                {items.length > 0 ? (
                                items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-800 line-clamp-1">
                                                {item.quantity}x {item.productName}
                                            </span>
                                            {item.discountTotal > 0 && (
                                                <span className="text-[9px] text-emerald-600 font-bold">
                                                    Ahorro: -${Number(item.discountTotal).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-black text-gray-900">
                                            ${Number(item.total).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-2">Detalles cargados en segundo plano...</p>
                            )}
                            </div>

                            <div className="flex justify-between items-end pt-3 border-t border-gray-200 border-dashed">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Pagado</span>
                                    <span className="text-[10px] text-gray-300">Incluye impuestos</span>
                                </div>
                                <span className="text-2xl font-black text-pink-500 tracking-tighter">
                                    ${orderData.total.toFixed(2)}
                                </span>
                            </div>
                            
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white rounded-full border border-gray-100" />
                        </div>

                        {/* --- BOTONES DE ACCIÓN --- */}
                        <div className="w-full space-y-3">
                            <button
                                onClick={onTrackOrder}
                                className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
                            >
                                <MapPin size={18} /> Rastrear Pedido
                            </button>

                            <button
                                onClick={onNewOrder}
                                className="w-full bg-white text-pink-400 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-pink-500 hover:bg-pink-50 transition-all flex items-center justify-center gap-2 border border-pink-200"
                            >
                                <RefreshCw size={16} /> Crear Nuevo Pedido
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccessModal;