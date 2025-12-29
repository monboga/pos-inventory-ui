import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock, Percent, Layers } from 'lucide-react';

// CORRECCIÓN: Importamos desde orderStatus, no trackingConfig
import { getStatusConfig, TRACKING_STEPS, ORDER_STATUS } from '../../constants/orderStatus';

const TrackingResult = ({ order, onBack }) => {
    
    // 1. Determinar estado actual
    const currentStatusId = order.statusId || order.status; // Soporte para ambos por si acaso
    const config = getStatusConfig(currentStatusId); // Usamos el helper centralizado
    const StatusIcon = config.icon;

    const isCanceled = currentStatusId === ORDER_STATUS.CANCELLED;
    
    // Encontrar el índice del paso actual para la barra de progreso
    const currentStepIndex = TRACKING_STEPS.findIndex(s => s.id === currentStatusId);

    // Construcción segura de imagen
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.includes('http')) return img;
        // Ajusta esta URL base según tu entorno
        const baseUrl = import.meta.env.VITE_API_URL || ''; 
        return `${baseUrl}/${img.replace(/\\/g, '/')}`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto"
        >
            <button 
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-pink-600 transition-colors text-xs font-bold uppercase tracking-wider bg-white/50 px-4 py-2 rounded-full"
            >
                <ArrowLeft size={16} /> Nueva Búsqueda
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative">
                
                {/* --- HEADER DINÁMICO --- */}
                <div className={`p-8 text-center border-b border-gray-50 transition-colors duration-500 ${isCanceled ? 'bg-red-50/50' : 'bg-white'}`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg mb-4 ${config.color}`}>
                        <StatusIcon size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
                        {isCanceled ? 'Pedido Cancelado' : `Orden #${order.orderNumber}`}
                    </h2>
                    <p className="text-gray-400 font-medium">
                        {isCanceled ? config.description : `Hola ${order.contactName || 'Cliente'}, ${config.description.toLowerCase()}`}
                    </p>
                </div>

                {/* --- TIMELINE (Oculto si cancelado o expirado) --- */}
                {!isCanceled && currentStatusId !== ORDER_STATUS.EXPIRED && (
                    <div className="px-6 py-12 bg-gray-50/30 overflow-x-auto">
                        <div className="relative flex justify-between items-start min-w-[300px]">
                            {/* Línea Base */}
                            <div className="absolute top-6 left-0 w-full h-1.5 bg-gray-200 rounded-full -z-10" />
                            
                            {/* Línea de Progreso */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                                className="absolute top-6 left-0 h-1.5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full -z-10 transition-all duration-1000 ease-out shadow-sm"
                            />

                            {/* Pasos */}
                            {TRACKING_STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const StepIcon = step.icon;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-3 w-20 relative z-0">
                                        <motion.div 
                                            initial={false}
                                            animate={{ 
                                                scale: isCurrent ? 1.1 : 1,
                                                backgroundColor: isCompleted ? '#db2777' : '#ffffff',
                                                borderColor: isCompleted ? '#db2777' : '#e5e7eb'
                                            }}
                                            className={`
                                                w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                                ${isCompleted ? 'text-white shadow-lg shadow-pink-200' : 'text-gray-300'}
                                                ${isCurrent ? 'ring-4 ring-pink-100' : ''}
                                            `}
                                        >
                                            <StepIcon size={20} strokeWidth={isCompleted ? 3 : 2} />
                                        </motion.div>
                                        
                                        <span className={`text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-500 ${
                                            isCompleted ? 'text-pink-600' : 'text-gray-300'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- LISTA DE PRODUCTOS --- */}
                <div className="p-8 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Tu Compra</h3>
                        <span className="bg-pink-50 text-pink-600 text-[10px] font-bold px-2 py-1 rounded-md">
                            {order.items?.length || 0} Artículos
                        </span>
                    </div>

                    <div className="space-y-4 mb-8">
                        {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                                        {getImageUrl(item.image) ? (
                                            <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={20} className="text-gray-300" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                {item.quantity}x
                                            </span>
                                            <span className="font-bold text-gray-800 text-sm line-clamp-1">
                                                {item.productName}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400">Unit: ${item.unitPrice.toFixed(2)}</span>
                                            {(item.discountAmount > 0) && (
                                                <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold w-fit bg-pink-50 text-pink-600">
                                                    <Percent size={10} />
                                                    <span>Ahorro -${item.discountAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono font-bold text-gray-900 block">
                                        ${item.lineTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl shadow-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Total Pagado</span>
                                <span className="text-xs text-gray-500">Impuestos incluidos</span>
                            </div>
                            <span className="text-4xl font-black tracking-tighter">
                                ${order.total?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TrackingResult;