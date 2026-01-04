import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, User, Phone, MapPin, Calendar, Eye, Package, Store, Truck } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { getStatusConfig } from '../../constants/orderStatus'; // Asegúrate de tener esto o usa un fallback
import { formatDateTime } from '../../utils/dateUtils';

const OrderDetailModal = ({ isOpen, orderId, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            setLoading(true);
            orderService.getById(orderId)
                .then(data => setDetail(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setDetail(null);
        }
    }, [isOpen, orderId]);

    if (!isOpen) return null;

    // Detectar si es Delivery (Basado en el string o si trae calle)
    const isDelivery = detail?.orderType === 'A Domicilio' || detail?.orderType === 'Delivery' || (detail?.contactStreet && detail.contactStreet.length > 0);
    const statusConfig = detail ? getStatusConfig(detail.statusId || 1) : {};

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0" onClick={onClose} />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
                    >

                        {/* --- HEADER --- */}
                        <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                                        <Receipt size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 tracking-tight">Detalle de Orden</h2>
                                        <p className="text-xs text-gray-500 font-medium">Folio #{detail?.orderNumber || '---'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Badges de Estado y Tipo */}
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusConfig.color || 'bg-gray-100 text-gray-500'}`}>
                                    {detail?.status || 'Cargando...'}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDelivery ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {isDelivery ? <Truck size={12} /> : <Store size={12} />}
                                    {isDelivery ? 'A Domicilio' : 'Recoger en Tienda'}
                                </span>
                            </div>
                        </div>

                        {loading || !detail ? (
                            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <div className="p-6 space-y-6">

                                    {/* SECCIÓN 1: DATOS CLIENTE */}
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <User size={16} className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</p>
                                                <p className="text-sm font-bold text-gray-800">{detail.customerName || 'Cliente General'}</p>
                                            </div>
                                        </div>
                                        {detail.customerPhone && (
                                            <div className="flex items-start gap-3">
                                                <Phone size={16} className="text-gray-400 mt-1" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</p>
                                                    <p className="text-sm font-medium text-gray-600 font-mono">{detail.customerPhone}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <Calendar size={16} className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha de Creación</p>
                                                <p className="text-xs font-medium text-gray-600 capitalize">{formatDateTime(detail.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECCIÓN 2: DIRECCIÓN (CONDICIONAL) */}
                                    {isDelivery && (
                                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
                                            <MapPin size={18} className="text-purple-500 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Dirección de Entrega</p>
                                                <p className="text-sm font-bold text-purple-900 leading-snug">
                                                    {detail.contactStreet} {detail.contactExternalNumber ? `#${detail.contactExternalNumber}` : ''}
                                                </p>
                                                {detail.contactNeighborhood && (
                                                    <p className="text-xs text-purple-700 mt-0.5">Col. {detail.contactNeighborhood}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECCIÓN 3: LISTA DE PRODUCTOS (TICKET STYLE) */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package size={16} className="text-gray-400" />
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Productos</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {detail.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm group">
                                                    <div className="flex gap-3">
                                                        <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded text-xs h-fit">
                                                            {item.quantity}x
                                                        </span>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-800 leading-tight">{item.productName}</span>
                                                            <span className="text-[10px] text-gray-400">PU: ${item.unitPrice.toFixed(2)}</span>
                                                            {item.discountTotal > 0 && (
                                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded w-fit mt-0.5">
                                                                    Ahorro -${item.discountTotal.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-gray-900">
                                                        ${item.total.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Separador Punteado */}
                                        <div className="relative h-8 flex items-center my-4 overflow-visible">
                                            {/* Línea Punteada */}
                                            <div className="w-full border-t-2 border-dashed border-gray-200" />
                                            
                                            {/* Círculo Recorte Izquierdo */}
                                            <div className="absolute -left-10 w-8 h-8 rounded-full bg-gray-900/60" 
                                                 style={{ boxShadow: 'inset -8px 0 10px -5px rgba(0,0,0,0.1)' }}>
                                            </div>
                                            
                                            {/* Círculo Recorte Derecho */}
                                            <div className="absolute -right-10 w-8 h-8 rounded-full bg-gray-900/60"
                                                 style={{ boxShadow: 'inset 8px 0 10px -5px rgba(0,0,0,0.1)' }}>
                                            </div>
                                        </div>

                                        {/* Totales */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span>Subtotal</span>
                                                <span>${(detail.total + (detail.items?.reduce((acc, i) => acc + i.discountTotal, 0) || 0)).toFixed(2)}</span>
                                            </div>
                                            {detail.items?.some(i => i.discountTotal > 0) && (
                                                <div className="flex justify-between items-center text-sm text-emerald-600 font-bold">
                                                    <span>Descuentos</span>
                                                    <span>-${detail.items.reduce((acc, i) => acc + i.discountTotal, 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-end pt-2">
                                                <span className="text-sm font-black text-gray-800 uppercase">Total a Pagar</span>
                                                <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                                    ${detail.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer con Botón de Cerrar (Opcional, ya que tiene la X arriba) */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Cerrar Detalle
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailModal;