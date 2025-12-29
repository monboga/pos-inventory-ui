import { Clock, CheckCircle2, Truck, XCircle, AlertTriangle, Package, Receipt } from 'lucide-react';

// 1. IDs de Estado (Coinciden con Backend)
export const ORDER_STATUS = {
    PENDING: 1,
    CONFIRMED: 2,
    COMPLETED: 3,
    CANCELLED: 4,
    EXPIRED: 5,
    INCOMING: 6
};

// 2. Configuración Visual Unificada (Admin + Public)
export const ORDER_STATUS_CONFIG = {
    [ORDER_STATUS.PENDING]: {
        label: 'Pendiente',
        publicLabel: 'Recibido',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Receipt,
        description: 'Hemos recibido tu pedido.',
        actionLabel: 'Confirmar Pedido'
    },
    [ORDER_STATUS.CONFIRMED]: {
        label: 'Confirmado',
        publicLabel: 'Preparando',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Package,
        description: 'Estamos empacando tus productos.',
        actionLabel: 'Enviar Repartidor'
    },
    [ORDER_STATUS.INCOMING]: {
        label: 'En Camino',
        publicLabel: 'En Camino',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Truck,
        description: 'Tu pedido va en ruta.',
        actionLabel: 'Completar Entrega'
    },
    [ORDER_STATUS.COMPLETED]: {
        label: 'Completado',
        publicLabel: 'Entregado',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
        description: '¡Disfruta tu compra!',
        actionLabel: null
    },
    [ORDER_STATUS.CANCELLED]: {
        label: 'Cancelado',
        publicLabel: 'Cancelado',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        description: 'El pedido fue cancelado.',
        actionLabel: null
    },
    [ORDER_STATUS.EXPIRED]: {
        label: 'Expirado',
        publicLabel: 'Expirado',
        color: 'bg-gray-100 text-gray-500 border-gray-200',
        icon: AlertTriangle,
        description: 'El tiempo de espera terminó.',
        actionLabel: null
    }
};

// 3. Helper para obtener config segura
export const getStatusConfig = (statusId) => {
    return ORDER_STATUS_CONFIG[statusId] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
};

// 4. Pasos del Tracking (Para TrackingResult)
// Definimos explícitamente qué estados aparecen en la barra de progreso
export const TRACKING_STEPS = [
    { id: ORDER_STATUS.PENDING, label: 'Recibido', icon: Receipt },
    { id: ORDER_STATUS.CONFIRMED, label: 'Preparando', icon: Package },
    { id: ORDER_STATUS.INCOMING, label: 'En Camino', icon: Truck },
    { id: ORDER_STATUS.COMPLETED, label: 'Entregado', icon: CheckCircle2 },
];