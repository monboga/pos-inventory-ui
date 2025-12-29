import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Package, Minus, Plus, ShoppingBag, Store, Truck, User, Phone, ChevronRight, MapPin, AlertCircle, Trash2, ChevronLeft } from 'lucide-react';
import { getItemFinancials } from '../../utils/financials';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

const CartItem = ({ item, onUpdateQuantity, onRemove, imgUrl, financials }) => {
    // Lógica para Swipe en Móvil
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, -50, 0], [0, 1, 1]);
    
    // Validación de Stock
    const currentStock = item.stock ?? item.Stock ?? 0;
    const isMaxedOut = item.quantity >= currentStock;

    return (
        <motion.div
            layout
            style={{ x, opacity, touchAction: "pan-y" }} // touchAction permite scroll vertical mientras arrastras horizontal
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.2, right: 0 }}
            onDragEnd={(e, info) => {
                if (info.offset.x < -100) {
                    onRemove(item.id);
                }
            }}
            className={`
                bg-white p-3 rounded-2xl shadow-sm border relative group overflow-hidden touch-pan-y
                ${isMaxedOut ? 'border-red-100' : 'border-gray-100'}
            `}
        >
            {/* Indicador de Swipe (Solo móvil) */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-active:opacity-100 transition-opacity md:hidden pointer-events-none">
                <div className="flex flex-col items-center">
                    <Trash2 size={16} />
                    <span className="text-[8px] font-bold">Soltar</span>
                </div>
            </div>

            {/* Badge Descuento */}
            {financials.isDiscountActive && (
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[14px] font-bold text-white shadow-sm z-20 ${financials.isBulkType ? 'bg-blue-500' : 'bg-pink-500'}`}>
                    -{financials.discountPct}%
                </div>
            )}

            <div className="flex gap-3 relative z-10 bg-white/80 backdrop-blur-[1px]">
                {/* Imagen */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                    {imgUrl ? (
                        <img src={imgUrl} className="w-full h-full object-cover" alt="" draggable="false" />
                    ) : (
                        <Package size={24} className="text-gray-300" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name || item.description}</h4>
                        <div className="flex justify-between items-center mt-0.5">
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                Unitario: ${financials.finalPrice.toFixed(2)}
                            </p>
                            {isMaxedOut && (
                                <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">MAX STOCK</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        {/* Control Cantidad */}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-400 hover:text-pink-500 transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-gray-700 w-4 text-center">{item.quantity}</span>
                            <button 
                                disabled={isMaxedOut}
                                onClick={() => !isMaxedOut && onUpdateQuantity(item.id, 1)}
                                className={`w-6 h-6 flex items-center justify-center rounded-md shadow-sm transition-colors ${
                                    isMaxedOut 
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                    : 'bg-white text-gray-400 hover:text-green-500'
                                }`}
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        
                        {/* Precio */}
                        <div className="flex flex-col items-end">
                            {financials.isDiscountActive && (
                                <span className="text-[10px] text-gray-400 line-through">
                                    ${(financials.originalPrice * item.quantity).toFixed(2)}
                                </span>
                            )}
                            <span className={`font-bold text-base ${financials.isDiscountActive ? 'text-pink-600' : 'text-gray-900'}`}>
                                ${financials.lineTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones Extra Desktop & Nudge */}
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between relative z-10">
                {/* Botón Eliminar Desktop (Oculto en móvil) */}
                <button 
                    onClick={() => onRemove(item.id)}
                    className="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                    <Trash2 size={14} /> 
                    <span>Quitar</span>
                </button>

                {/* Texto ayuda para móvil */}
                <span className="md:hidden text-[9px] text-gray-300 italic flex items-center gap-1">
                    <ChevronLeft size={10} /> Desliza para borrar
                </span>

                {/* Nudge Mayoreo */}
                {financials.isNearDiscount && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[9px] font-bold text-blue-600 flex items-center gap-1">
                            <AlertCircle size={10} />
                            Faltan {financials.minQty - item.quantity}
                        </span>
                        <button
                            disabled={currentStock < financials.minQty} // Deshabilitar si no hay stock suficiente para la oferta
                            onClick={() => onUpdateQuantity(item.id, financials.minQty - item.quantity)}
                            className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +Agregar
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

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
    // Helper de Imágenes
    const getProductImageUrl = (product) => {
        const rawImg = product.image || product.Image;
        if (!rawImg) return null;
        if (rawImg.includes("Uploads")) {
            const cleanPath = rawImg.replace(/\\/g, '/');
            const prefix = cleanPath.startsWith('/') ? '' : '/';
            return `${API_BASE_URL}${prefix}${cleanPath}`;
        }
        return rawImg;
    };

    // Lógica financiera
    // const getItemFinancials = (item) => {
    //     const price = Number(item.price || item.Price || 0);
    //     const qty = Number(item.quantity || 0);
    //     const discountObj = item.discount || item.Discount;
    //     const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
    //     const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);
    //     const isBulkType = minQty > 1;
    //     const isDiscountActive = discountPct > 0 && qty >= minQty;
    //     const finalUnitPrice = isDiscountActive ? price * (1 - discountPct / 100) : price;

    //     return {
    //         originalPrice: price,
    //         finalPrice: finalUnitPrice,
    //         lineTotal: finalUnitPrice * qty,
    //         savings: (price - finalUnitPrice) * qty,
    //         isDiscountActive,
    //         isBulkType,
    //         discountPct,
    //         minQty,
    //         isNearDiscount: isBulkType && !isDiscountActive && (minQty - qty <= 2)
    //     };
    // };

    const totals = cart.reduce((acc, item) => {
        const fin = getItemFinancials(item);
        acc.subtotal += fin.lineTotal;
        return acc;
    }, { subtotal: 0 });

    const isValidBasic = (contact?.name || '').trim().length > 0 && (contact?.phone || '').length === 10;
    const isValidAddress = !contact?.isDelivery || ((contact?.street || '').trim().length > 0 && (contact?.neighborhood || '').trim().length > 0);
    const canCheckout = cart.length > 0 && isValidBasic && isValidAddress;

    // Helper para actualizar inputs
    const updateContact = (key, val) => {
        if (setContact) {
            setContact(prev => ({ ...prev, [key]: val }));
        }
    };

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

                        {/* LISTA */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Package size={32} className="opacity-30" />
                                    </div>
                                    <p className="font-medium text-sm">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <CartItem 
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemove={onRemove}
                                        imgUrl={getProductImageUrl(item)}
                                        financials={getItemFinancials(item)}
                                    />
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10 border-t border-gray-50">
                            
                            {/* Toggle Delivery */}
                            <div className="flex bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-100">
                                <button
                                    onClick={() => updateContact('isDelivery', false)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${!contact?.isDelivery ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Store size={16} /> Recoger
                                </button>
                                <button
                                    onClick={() => updateContact('isDelivery', true)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${contact?.isDelivery ? 'bg-white text-purple-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Truck size={16} /> A Domicilio
                                </button>
                            </div>

                            {/* Inputs Datos */}
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="relative flex-[1.5]">
                                        <User size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            placeholder="Tu Nombre"
                                            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                                            value={contact?.name || ''}
                                            onChange={e => updateContact('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <Phone size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            type="tel" maxLength={10} placeholder="Tel. (10)"
                                            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                                            value={contact?.phone || ''}
                                            onChange={e => updateContact('phone', e.target.value.replace(/\D/g,''))}
                                        />
                                    </div>
                                </div>

                                {/* Dirección (Animada) */}
                                <AnimatePresence>
                                    {contact?.isDelivery && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-3 pt-1"
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative flex-[2]">
                                                    <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                                    <input 
                                                        placeholder="Calle y Número" 
                                                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                                                        value={contact?.street || ''} 
                                                        onChange={e => updateContact('street', e.target.value)} 
                                                    />
                                                </div>
                                                <input 
                                                    placeholder="# Ext" 
                                                    className="flex-1 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none text-center transition-all"
                                                    value={contact?.externalNumber || ''} 
                                                    onChange={e => updateContact('externalNumber', e.target.value)} 
                                                />
                                            </div>
                                            <input 
                                                placeholder="Colonia y Referencias" 
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                                                value={contact?.neighborhood || ''} 
                                                onChange={e => updateContact('neighborhood', e.target.value)} 
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

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

                        {/* FOOTER
                        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
                            {totals.totalSavings > 0 && (
                                <div className="flex justify-between items-center mb-4 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700">
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Ahorro total</span>
                                    </div>
                                    <span className="font-bold text-sm">-${totals.totalSavings.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total Final</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tight">
                                    ${totals.subtotal.toFixed(2)}
                                </span>
                            </div>

                            <button
                                disabled={cart.length === 0}
                                onClick={onCheckout}
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-pink-200 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Proceder al Pago
                            </button>
                        </div> */}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PublicCart;