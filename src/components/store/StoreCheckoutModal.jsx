import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, CheckCircle2, Sparkles } from 'lucide-react';

const StoreCheckoutModal = ({ 
    isOpen, 
    onClose, 
    contact, 
    setContact, 
    onConfirm, 
    isSubmitting,
    orderSummary // Objeto con { total, savings } calculado en el padre
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={onClose} 
                    />
                    
                    {/* Contenedor del Modal */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl border border-white/20"
                    >
                        {/* Header con Gradiente Rosa ALBA */}
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <Sparkles size={120} className="absolute -top-10 -right-10 rotate-12" />
                            </div>
                            <h3 className="font-black text-2xl tracking-tight relative z-10">Confirmar Pedido</h3>
                            <p className="text-pink-100 text-[10px] font-black uppercase tracking-[0.2em] mt-2 relative z-10">
                                Insumos de Calidad
                            </p>
                        </div>

                        <form onSubmit={onConfirm} className="p-8 space-y-5">
                            {/* Resumen Rápido de Pago */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-2 flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-pink-500">Total a Pagar</p>
                                    <p className="text-3xl font-black text-gray-900 font-mono tracking-tighter">
                                        ${orderSummary.total.toFixed(2)}
                                    </p>
                                </div>
                                {orderSummary.savings > 0 && (
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 leading-none">Tu Ahorro</p>
                                        <p className="text-sm font-black text-emerald-600">-${orderSummary.savings.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Campo Nombre */}
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                                <input
                                    required
                                    placeholder="Nombre completo"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-pink-50 outline-none font-bold text-sm transition-all"
                                    value={contact.name}
                                    onChange={e => setContact({ ...contact, name: e.target.value })}
                                />
                            </div>

                            {/* Campo Teléfono */}
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                                <input
                                    required
                                    type="tel"
                                    placeholder="WhatsApp de contacto"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-pink-50 outline-none font-bold text-sm transition-all"
                                    value={contact.phone}
                                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-pink-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>Finalizar Pedido <CheckCircle2 size={18} /></>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StoreCheckoutModal;