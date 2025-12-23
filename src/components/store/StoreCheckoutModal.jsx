import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Receipt, User, Phone, AlertCircle } from 'lucide-react';

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
    
    // --- VALIDACIONES ---
    const phoneRegex = /^\d{10}$/; // Exactamente 10 dígitos
    const isNameValid = contact.name?.trim().length > 0;
    const isPhoneValid = phoneRegex.test(contact.phone?.trim() || '');
    const isValid = isNameValid && isPhoneValid;

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
        if(!isValid) return;

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

                        {/* Formulario */}
                        <div className="bg-gray-50 p-6 border-t-2 border-dashed border-gray-300 relative">
                            <div className="absolute -left-2 top-[-10px] w-5 h-5 bg-gray-900/60 rounded-full" />
                            <div className="absolute -right-2 top-[-10px] w-5 h-5 bg-gray-900/60 rounded-full" />

                            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">Datos de Contacto *</label>
                                    <div className="space-y-3">
                                        {/* Nombre */}
                                        <div className="relative">
                                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isNameValid ? 'text-pink-500' : 'text-gray-400'}`} size={16} />
                                            <input
                                                required
                                                placeholder="Nombre completo"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                                value={contact.name}
                                                onChange={e => setContact({ ...contact, name: e.target.value })}
                                            />
                                        </div>

                                        {/* Teléfono */}
                                        <div className="relative">
                                            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isPhoneValid ? 'text-pink-500' : 'text-gray-400'}`} size={16} />
                                            <input
                                                required
                                                type="tel"
                                                maxLength={10}
                                                placeholder="WhatsApp (10 dígitos)"
                                                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none transition-all ${
                                                    contact.phone && !isPhoneValid ? 'border-red-300 text-red-600' : 'border-gray-200'
                                                }`}
                                                value={contact.phone}
                                                onChange={(e) => {
                                                    // Solo permitir números
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setContact({ ...contact, phone: val });
                                                }}
                                            />
                                        </div>
                                        {contact.phone && !isPhoneValid && (
                                            <p className="text-[10px] text-red-500 font-bold ml-2 flex items-center gap-1 animate-pulse">
                                                <AlertCircle size={10} /> Faltan {10 - contact.phone.length} dígitos
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className={`
                                        w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all
                                        ${isValid 
                                            ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}
                                    `}
                                >
                                    {isSubmitting ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <>Enviar Pedido <CheckCircle2 size={18} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StoreCheckoutModal;