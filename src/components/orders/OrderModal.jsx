import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Hooks y Componentes
import { useOrderForm } from '../../hooks/orders/useOrderForm';
import OrderProductList from './OrderProductList';
import OrderCart from './OrderCart';

// REUTILIZACIÓN DE COMPONENTES DE LA TIENDA
import StoreCheckoutModal from '../store/StoreCheckoutModal';
import OrderSuccessModal from '../store/OrderSuccessModal';

const OrderModal = ({ isOpen, onClose, onSuccess }) => {
    // Inicializamos el Hook
    const logic = useOrderForm(onSuccess, onClose);

    if (!isOpen) return null;

    return (
        <>
            {/* === MODAL PRINCIPAL (POS) === */}
            <AnimatePresence>
                {isOpen && !logic.isSuccessOpen && ( // Ocultamos el principal si hay éxito para enfocar el ticket final
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
                            onClick={onClose} 
                        />
                        
                        {/* Contenedor Principal */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-7xl h-[90vh] rounded-[2.5rem] z-10 overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/20 relative"
                        >
                            {/* Botón Cerrar Flotante */}
                            <button 
                                onClick={onClose} 
                                className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm backdrop-blur transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* Panel Izquierdo: Productos */}
                            <OrderProductList 
                                cart={logic.cart}
                                onAddToCart={logic.addToCart}
                            />

                            {/* Panel Derecho: Carrito */}
                            <OrderCart 
                                cart={logic.cart}
                                contact={logic.contact}
                                setContact={logic.setContact}
                                orderSummary={logic.orderSummary}
                                onUpdateQuantity={logic.updateQuantity}
                                onRemove={logic.removeFromCart}
                                onPhoneChange={logic.handlePhoneChange}
                                isValidName={logic.isValidName}
                                isValidPhone={logic.isValidPhone}
                                canSubmit={logic.canSubmit}
                                onRequestCheckout={logic.requestCheckout} // Dispara el modal de confirmación
                                loading={logic.loading}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* === MODAL 1: CONFIRMACIÓN (TICKET) === */}
            {/* Reutilizamos el diseño del Store pero adaptado al admin */}
            <StoreCheckoutModal 
                isOpen={logic.isCheckoutOpen}
                onClose={() => logic.setIsCheckoutOpen(false)}
                contact={logic.contact}
                setContact={logic.setContact}
                onConfirm={(e) => { e.preventDefault(); logic.confirmOrder(); }} // Conectamos con la API
                isSubmitting={logic.loading}
                orderSummary={logic.orderSummary}
                cart={logic.cart}
            />

            {/* === MODAL 2: ÉXITO === */}
            <OrderSuccessModal 
                isOpen={logic.isSuccessOpen}
                orderData={logic.lastOrder}
                onNewOrder={logic.startNewOrder} // Permite seguir vendiendo sin salir
                onTrackOrder={() => {
                    // Opcional: Ir al detalle de la orden recién creada en el admin
                    onClose();
                    // window.location.href = `/orders/${logic.lastOrder.id}`; 
                }}
            />
        </>
    );
};

export default OrderModal;