import React from 'react';
import { motion } from 'framer-motion';
import { Package, Phone, Eye, MapPin, Truck, Store, CheckCircle2 } from 'lucide-react'; // Agregamos iconos
import OrderTimer from './OrderTimer';
import { getStatusConfig, ORDER_STATUS } from '../../constants/orderStatus';
import { getSourceConfig } from '../../constants/orderSource';

const OrderCard = ({ order, onOpenDetail, onConfirm, onCancel, onRefresh, onAdvanceStatus }) => {
    // Safety checks
    const statusId = order.statusId || ORDER_STATUS.PENDING;
    const isPending = statusId === ORDER_STATUS.PENDING;
    const statusConfig = getStatusConfig(statusId);

    const sourceConfig = getSourceConfig(order.source);

    // Validamos si es Delivery: Puede venir como string "A Domicilio" o ID 2
    const isDelivery = order.orderType === 'A Domicilio' || order.orderType === 'Delivery' || order.orderTypeId === 2;

    const displayName = order.clientName || order.contactName || "Cliente General";
    const displayPhone = order.contactPhone || order.clientPhone; // Obtenemos el teléfono disponible
    const itemCount = order.itemsCount || (order.items ? order.items.length : 0);

    let actionLabel = statusConfig.actionLabel;
    let ActionIcon = statusConfig.icon;
    let isPickupAction = false;

    // Si está Confirmado (2) y es Pickup (1), cambiamos el botón
    if (order.statusId === 2 && order.orderTypeId === 1) {
        actionLabel = "Completar Venta";
        ActionIcon = CheckCircle2; // Icono de check
        isPickupAction = true;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col gap-4 group relative overflow-hidden h-full cursor-pointer"
            onClick={() => onOpenDetail(order.id)}
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur p-2 rounded-full shadow-sm z-10 text-pink-500">
                <Eye size={18} />
            </div>
            {/* Barra de estado superior */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${statusConfig.color.replace('text-', 'bg-').split(' ')[0]}`} />

            {/* Header: Folio y Nombre */}
            <div className="flex justify-between items-start pt-2">
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        #{order.orderNumber}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1" title={displayName}>
                        {displayName}
                    </h3>

                    {/* Badge de Origen y Tipo */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {/* Fuente */}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${sourceConfig.color}`}>
                            <sourceConfig.icon size={10} />
                            {sourceConfig.shortLabel}
                        </span>
                        {/* Tipo de Entrega (Pickup vs Delivery) */}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${isDelivery ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                            {isDelivery ? <Truck size={10} /> : <Store size={10} />}
                            {isDelivery ? 'Delivery' : 'Pickup'}
                        </span>
                    </div>
                </div>

                {isPending && (
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <OrderTimer expirationDate={order.expirationDate} onExpire={onRefresh} />
                    </div>
                )}
            </div>

            {/* --- NUEVA SECCIÓN: CONTACTO Y DIRECCIÓN --- */}
            <div className="space-y-2 border-t border-b border-gray-50 py-3 my-1">
                {/* Teléfono */}
                {displayPhone && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-xs font-medium font-mono">{displayPhone}</span>
                    </div>
                )}

                {/* Dirección (Solo si es Delivery) */}
                {isDelivery && (
                    <div className="flex items-start gap-2 text-gray-500">
                        <MapPin size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 leading-tight">
                                {order.contactStreet} {order.contactExternalNumber ? `#${order.contactExternalNumber}` : ''}
                            </span>
                            {order.contactNeighborhood && (
                                <span className="text-[10px] text-gray-400 line-clamp-1">
                                    Col. {order.contactNeighborhood}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Financiera */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                    <Package size={16} />
                    <span className="text-xs font-bold">{itemCount} pzs</span>
                </div>
                <div className="text-right">
                    <span className="block text-xl font-black text-gray-900">
                        ${order.total?.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Footer / Acciones */}
            <div className="mt-auto pt-2 flex gap-2" onClick={e => e.stopPropagation()}>
                {actionLabel ? (
                    <button
                        onClick={() => onAdvanceStatus && onAdvanceStatus(order, order.statusId)}
                        className="flex-1 py-2.5 rounded-xl bg-pink-50 text-pink-600 font-bold text-xs uppercase tracking-wider hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <ActionIcon size={14} />
                        {actionLabel}
                    </button>
                ) : (
                    <div className={`w-full py-2 rounded-xl text-center text-xs font-bold ${statusConfig.color} opacity-80`}>
                        {statusConfig.label}
                    </div>
                )}

                {isPending && (
                    <button
                        onClick={() => onCancel(order.id)}
                        className="px-3 py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                        title="Cancelar Pedido"
                    >
                        <statusConfig.icon size={14} className="rotate-45" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default OrderCard;