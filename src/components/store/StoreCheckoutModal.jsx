import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Receipt, User, Phone, Store, Truck, MapPin } from 'lucide-react';

const StoreCheckoutModal = ({
    isOpen,
    onClose,
    contact,
    setContact,
    onConfirm,
    isSubmitting,
    orderSummary,
    cart = []
}) => {

    // // --- VALIDACIONES ---
    // const phoneRegex = /^\d{10}$/; // Exactamente 10 dígitos
    // const isNameValid = contact.name?.trim().length > 0;
    // const isPhoneValid = phoneRegex.test(contact.phone?.trim() || '');
    // const isValid = isNameValid && isPhoneValid;

    // --- GENERADOR DE MENSAJE WHATSAPP (Lista para usar en el refactor) ---
    const generateWhatsAppLink = () => {
        // Formatear items
        const itemsList = cart.map(item => {
            const price = item.price || item.Price || 0;
            // Usamos un guión y salto de línea como pediste
            return `- ${item.description || item.name} (${item.quantity} pzs) $${(price * item.quantity).toFixed(2)}`;
        }).join('\n');

        const message = `Hola 👋 ALBA soy ${contact.name},
realicé mi pedido a través del portal web con los siguientes productos:

${itemsList}

Total a pagar: $${orderSummary.total.toFixed(2)}
Mi teléfono de contacto es: ${contact.phone}`;

        // Retornamos el mensaje para que el padre decida a qué numero enviarlo
        // Ojo: encodeURIComponent es vital para que funcione el link
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;

        const waLink = generateWhatsAppLink();

        onConfirm(e, waLink);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Ticket Container */}
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        className="bg-gray-100 w-full max-w-sm relative z-10 shadow-2xl overflow-hidden rounded-t-xl rounded-b-xl"
                    >
                        {/* Cabecera Ticket */}
                        <div className="bg-white p-6 pb-4 border-b-2 border-dashed border-gray-300 relative">
                            {/* "Muescas" decorativas */}
                            <div className="absolute -left-2 bottom-[-10px] w-5 h-5 bg-gray-900/60 rounded-full" />
                            <div className="absolute -right-2 bottom-[-10px] w-5 h-5 bg-gray-900/60 rounded-full" />

                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-pink-50 p-2 rounded-lg text-pink-500">
                                    <Receipt size={24} />
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 uppercase tracking-tight">Confirmar Orden</h3>
                            <p className="text-gray-400 text-xs font-medium mt-1">Revisa los detalles antes de enviar.</p>
                        </div>

                        {/* Cuerpo Ticket (Resumen) */}
                        <div className="bg-white px-6 py-4 space-y-4">
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs text-gray-600">
                                        <span className="truncate w-3/4">
                                            <span className="font-bold mr-1">{item.quantity}x</span>
                                            {item.name || item.description}
                                        </span>
                                        <span className="font-mono">
                                            ${((item.price || item.Price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-dashed border-gray-200 space-y-1">
                                {orderSummary.savings > 0 && (
                                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                                        <span>Descuentos aplicados</span>
                                        <span>-${orderSummary.savings.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-sm font-bold text-gray-800 uppercase">Total a Pagar</span>
                                    <span className="text-2xl font-black text-gray-900 font-mono tracking-tighter">
                                        ${orderSummary.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Seccion de solo lectura */}
                        <div className="bg-gray-50 p-6 border-t-2 border-dashed border-gray-300 relative">
                            <div className="absolute -left-2 top-[-10px] w-5 h-5 bg-gray-900/60 rounded-full" />
                            <div className="absolute -right-2 top-[-10px] w-5 h-5 bg-gray-900/60 rounded-full" />
                            <div className="flex gap-4 items-start border-b border-dashed border-gray-100 pb-4">
                                {/* Icono Dinámico */}
                                <div className={`p-3 rounded-2xl flex-shrink-0 ${contact.isDelivery ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {contact.isDelivery ? <Truck size={24} /> : <Store size={24} />}
                                </div>

                                <div className="space-y-1 overflow-hidden">
                                    {/* Etiqueta */}
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${contact.isDelivery ? 'text-purple-500' : 'text-orange-500'}`}>
                                        {contact.isDelivery ? 'Envío a Domicilio' : 'Recoger en Tienda'}
                                    </p>

                                    {/* Nombre (Solo lectura) */}
                                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1 line-clamp-1">
                                        <User size={12} className="text-gray-400" /> {contact.name || 'Sin Nombre'}
                                    </h3>

                                    {/* Teléfono (Solo lectura) */}
                                    <p className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                                        <Phone size={12} /> {contact.phone || '---'}
                                    </p>
                                </div>
                            </div>

                            {/* 2. Dirección (SECCIÓN CONDICIONAL: Solo si es Delivery) */}
                            {contact.isDelivery && (
                                <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-start border border-gray-100">
                                    <MapPin size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 leading-tight">
                                            {contact.street} #{contact.externalNumber}
                                        </p>
                                        {contact.neighborhood && (
                                            <p className="text-[10px] text-gray-400 mt-0.5">Col. {contact.neighborhood}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={onConfirm} // Cambiamos type="submit" por onClick directo
                                disabled={isSubmitting} // Quitamos !isValid
                                className="w-full py-4 rounded-xl bg-pink-600 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-pink-200 hover:bg-pink-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>Enviar Pedido <CheckCircle2 size={18} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StoreCheckoutModal;