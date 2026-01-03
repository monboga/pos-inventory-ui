import React from 'react';
import { Package } from 'lucide-react';

const CartEmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Package size={32} className="opacity-30" />
        </div>
        <p className="font-medium text-sm">Tu carrito está vacío</p>
    </div>
);

export default CartEmptyState;