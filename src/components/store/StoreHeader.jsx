import React, { forwardRef } from 'react'; // 1. Importar forwardRef
import { ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 2. Envolver el componente en forwardRef
const StoreHeader = forwardRef(({ cartCount, onOpenCart, onReturn, logo }, ref) => (
    <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-4 flex justify-between items-center">
        <button
            onClick={onReturn}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-pink-600 transition-all font-bold text-[10px] uppercase tracking-widest"
        >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline font-medium">Cerrar y Volver</span>
        </button>

        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 shadow-md rounded-xl">
                {logo ? (
                    <img 
                        src={logo} 
                        alt="Logo del negocio" 
                        className="h-12 w-auto object-contain rounded-xl" 
                    />
                ) : (
                    <div className="bg-pink-500 text-white p-2 rounded-xl shadow-lg shadow-pink-100 flex items-center justify-center h-full w-full">
                        <Package size={20} />
                    </div>
                )}
            </div>
            <h1 className="font-extrabold text-gray-800 text-xl tracking-tight leading-none">
                Catálogo de Productos
            </h1>
        </div>

        <button
            ref={ref} // 3. Asignar la referencia al botón del carrito
            onClick={onOpenCart}
            className="relative p-2.5 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
        >
            <ShoppingCart size={24} />
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
                    >
                        {cartCount}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    </header>
));

export default StoreHeader;