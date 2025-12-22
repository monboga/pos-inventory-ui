import React from 'react';
import { ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StoreHeader = ({ cartCount, onOpenCart, onReturn }) => (
    <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-4 flex justify-between items-center">
        <button
            onClick={onReturn}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-pink-600 transition-all font-black text-[10px] uppercase tracking-widest"
        >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Cerrar y Volver</span>
        </button>

        <div className="flex items-center gap-2">
            <div className="bg-pink-500 text-white p-2 rounded-lg"><Package size={20} /></div>
            <h1 className="font-bold text-gray-800 text-lg uppercase tracking-tighter">e-ALBA</h1>
        </div>

        <button
            onClick={onOpenCart}
            className="relative p-2.5 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
        >
            <ShoppingCart size={24} />
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm"
                    >
                        {cartCount}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    </header>
);

export default StoreHeader;