import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Monitor, Package, Phone, CheckCircle } from 'lucide-react';
import OrderTimer from './OrderTimer';

const OrderCard = ({ order, onOpenDetail, onConfirm, onCancel, onRefresh }) => {
    const isPending = order.status === 'Pending';

    // Prioridad de nombre según el JSON de getAll
    const displayName = order.contactName || order.clientName || "Cliente General";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col gap-4 group relative overflow-hidden h-full"
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-200 via-pink-400 to-pink-200" />

            {/* Header */}
            <div className="flex justify-between items-start pt-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Folio</span>
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter">#{order.orderNumber}</h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase ${order.source === 'Web' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                    }`}>
                    {order.source === 'Web' ? <Globe size={14} /> : <Monitor size={14} />}
                    {order.source}
                </div>
            </div>

            {/* Cliente */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-pink-500 font-black text-sm uppercase shadow-inner">
                    {displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-black text-gray-800 leading-tight truncate">{displayName}</span>
                    {order.contactPhone && (
                        <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 mt-1">
                            <Phone size={10} className="text-pink-300" /> {order.contactPhone}
                        </span>
                    )}
                </div>
            </div>

            {/* BOTÓN DE INSUMOS (Dispara el Modal) */}
            <button
                onClick={() => onOpenDetail(order.id)}
                className="bg-gray-50/50 rounded-[1.8rem] p-5 border border-dashed border-gray-200 flex flex-col items-center gap-2 hover:bg-pink-50/30 hover:border-pink-200 transition-all group/btn"
            >
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 group-hover/btn:text-pink-500 uppercase tracking-widest">
                    <Package size={14} />
                    Ver Insumos del Pedido
                </div>
            </button>

            <div className="flex items-center justify-between px-1 mt-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total del pedido</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter leading-tight flex items-baseline font-mono">
                        <small className="text-xs font-bold text-gray-400 mr-1">$</small>
                        {order.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>

                    {/* NUEVO: Badge de Ahorro proveniente del payload getAll */}
                    {order.totalSavings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg mt-1 self-start">
                            Ahorraste: ${order.totalSavings.toFixed(2)}
                        </span>
                    )}
                </div>
                {isPending && (
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expira en</span>
                        <OrderTimer
                            expirationDate={order.expirationDate}
                            onExpire={onRefresh}
                        />
                    </div>
                )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 mt-2">
                {isPending ? (
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => onCancel(order.id)} className="py-3 rounded-2xl border border-rose-100 text-rose-500 font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all">Anular</button>
                        <button onClick={() => onConfirm(order)} className="py-3 rounded-2xl bg-pink-500 text-white font-black text-[10px] uppercase shadow-lg shadow-pink-100">Cobrar</button>
                    </div>
                ) : (
                    <div className={`flex items-center justify-between p-3 rounded-2xl ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                        <CheckCircle size={16} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default OrderCard