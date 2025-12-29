import { Store, Truck } from 'lucide-react';

export const ORDER_TYPES = {
    PICKUP: 1,
    DELIVERY: 2
};

export const ORDER_TYPE_CONFIG = {
    [ORDER_TYPES.PICKUP]: {
        label: 'Recoger en Tienda',
        icon: Store,
        color: 'text-orange-600 bg-orange-50 border-orange-100', // Identificador visual
        requiresAddress: false
    },
    [ORDER_TYPES.DELIVERY]: {
        label: 'A Domicilio',
        icon: Truck,
        color: 'text-purple-600 bg-purple-50 border-purple-100',
        requiresAddress: true
    }
};