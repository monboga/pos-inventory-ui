import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ChevronRight } from 'lucide-react';

// Components
import CartItem from './cart/CartItem';
import CartContactForm from './cart/CartContactForm';
import CartEmptyState from './cart/CartEmptyState';

// Custom Hooks
import { useCartHelpers } from '../../hooks/store/useCartHelpers';
import { useCheckoutForm } from '../../hooks/store/useCheckoutForm';

const PublicCart = ({ 
    isOpen, 
    onClose, 
    cart, 
    onUpdateQuantity, 
    onRemove, 
    onCheckout,
    contact,
    setContact,
 }) => {
    
    // 1. Lógica de UI (Imágenes y Totales)
    const { getProductImageUrl, totals } = useCartHelpers(cart);

    // 2. Lógica de Formulario (Validación)
    const { updateContact, canCheckout } = useCheckoutForm(contact, setContact, cart.length);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/40 z-[60] backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#F8F9FA] z-[70] shadow-2xl flex flex-col border-l border-white/50"
                    >
                        {/* HEADER */}
                        <div className="px-6 py-5 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-pink-100 p-2 rounded-xl text-pink-600">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-gray-800 leading-tight">Tu Carrito</h2>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {totals.count} {totals.count === 1 ? 'producto' : 'productos'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* LISTA DE ITEMS */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {cart.length === 0 ? (
                                <CartEmptyState />
                            ) : (
                                cart.map(item => (
                                    <CartItem 
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemove={onRemove}
                                        imgUrl={getProductImageUrl(item)}
                                    />
                                ))
                            )}
                        </div>

                        {/* FORMULARIO Y FOOTER */}
                        <div className="p-6 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10 border-t border-gray-50">
                            
                            <CartContactForm 
                                contact={contact}
                                updateContact={updateContact}
                            />

                            {/* Footer y Botón */}
                            <div className="pt-2 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-end mb-4 pt-2">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total Final</span>
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">${totals.subtotal.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={onCheckout}
                                    disabled={!canCheckout}
                                    className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2
                                        ${canCheckout ? 'bg-pink-600 text-white shadow-pink-200 hover:bg-pink-700 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
                                    `}
                                >
                                    Confirmar Datos <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PublicCart;