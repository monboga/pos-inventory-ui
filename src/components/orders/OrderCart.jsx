import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Minus, Trash2, User, Phone, AlertCircle, ShoppingBag, Package } from 'lucide-react';
import { getItemFinancials } from '../../utils/financials';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

const OrderCart = ({ 
    cart, 
    contact, 
    setContact, 
    orderSummary, 
    onUpdateQuantity, 
    onRemove, 
    onPhoneChange,
    isValidName,
    isValidPhone,
    canSubmit,
    onRequestCheckout, // Cambiamos nombre: onSubmit -> onRequestCheckout
    loading
}) => {

    // Helper para imagen (consistente con ProductCard)
    const getImgUrl = (product) => {
        const rawImg = product.image || product.Image;
        if (!rawImg) return null;
        if (rawImg.includes("Uploads")) {
            const cleanPath = rawImg.replace(/\\/g, '/');
            const prefix = cleanPath.startsWith('/') ? '' : '/';
            return `${API_BASE_URL}${prefix}${cleanPath}`;
        }
        return rawImg;
    };

    return (
        <div className="w-full md:w-[450px] bg-white flex flex-col shadow-2xl relative z-20 h-full border-l border-gray-100">
            {/* Header Resumen */}
            {/* FIX 1: Agregamos pr-16 para dar espacio al botón de cerrar del modal padre */}
            <div className="p-6 pr-16 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-pink-500" /> Resumen
                </h3>
                <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                    {orderSummary.count} ítems
                </span>
            </div>

            {/* Lista de Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/30">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-3 opacity-60">
                        <ShoppingBag size={48} strokeWidth={1} />
                        <p className="text-xs font-bold uppercase tracking-wider">El pedido está vacío</p>
                    </div>
                ) : (
                    cart.map(item => {
                        const fin = getItemFinancials(item);
                        const imgUrl = getImgUrl(item);

                        return (
                            <motion.div layout key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 group relative overflow-hidden">
                                
                                {/* FIX 2: Imagen del Producto */}
                                <div className="w-16 h-16 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-gray-50">
                                    {imgUrl ? (
                                        <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <Package size={20} className="text-gray-300" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-bold text-sm text-gray-800 line-clamp-1" title={item.description}>
                                            {item.description}
                                        </p>
                                        <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col gap-1">
                                            {/* Precios y Badges */}
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400">Unit: ${fin.unitPrice.toFixed(2)}</span>
                                                {fin.isDiscountActive && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${fin.isBulkType ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                        -{fin.discountPct}% {fin.isBulkType ? 'MAYOREO' : 'OFERTA'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* FIX 3: Botón para completar descuento (Upsell) */}
                                            {fin.isNearDiscount && (
                                                <button 
                                                    onClick={() => onUpdateQuantity(item.id, fin.minQty - item.quantity)}
                                                    className="text-[9px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors w-fit animate-pulse"
                                                >
                                                    <Plus size={8} /> Agregar {fin.minQty - item.quantity} para oferta
                                                </button>
                                            )}
                                        </div>

                                        {/* Controles Cantidad Compactos */}
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-black text-pink-600 text-sm">${fin.lineTotal.toFixed(2)}</span>
                                            
                                            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                                <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md text-gray-400 hover:text-red-500 transition-all shadow-sm hover:shadow">
                                                    <Minus size={10}/>
                                                </button>
                                                <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md text-gray-400 hover:text-green-600 transition-all shadow-sm hover:shadow">
                                                    <Plus size={10}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Footer: Totales y Formulario */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-10">
                {/* Totales */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Total a Pagar</p>
                        {orderSummary.savings > 0 && (
                            <p className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit flex items-center gap-1">
                                <Sparkles size={10} /> Ahorras ${orderSummary.savings.toFixed(2)}
                            </p>
                        )}
                    </div>
                    <span className="text-3xl font-black text-pink-600 tracking-tighter">
                        ${orderSummary.total.toFixed(2)}
                    </span>
                </div>

                {/* Formulario */}
                <div className="space-y-3 mb-4">
                    <div className="relative group">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isValidName ? 'text-pink-500' : 'text-gray-400'}`} size={16}/>
                        <input 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-pink-200 rounded-xl text-sm font-medium outline-none transition-all"
                            placeholder="Nombre del Cliente *"
                            value={contact.name}
                            onChange={e => setContact({...contact, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="relative group">
                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isValidPhone ? 'text-pink-500' : 'text-gray-400'}`} size={16}/>
                        <input 
                            type="tel"
                            maxLength={10}
                            className={`
                                w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all
                                ${!isValidPhone ? 'border-red-200 bg-red-50 text-red-600' : 'border-transparent focus:bg-white focus:border-pink-200'}
                            `}
                            placeholder="Teléfono (10 dígitos)"
                            value={contact.phone}
                            onChange={e => onPhoneChange(e.target.value)}
                        />
                    </div>
                    {!isValidPhone && (
                        <p className="text-[10px] text-red-500 font-bold ml-2 flex items-center gap-1">
                            <AlertCircle size={10} /> Debe tener 10 dígitos numéricos
                        </p>
                    )}
                </div>

                <button 
                    onClick={onRequestCheckout}
                    disabled={loading || !canSubmit}
                    className={`
                        w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg
                        ${canSubmit 
                            ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200 active:scale-[0.98]' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                    `}
                >
                    {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                        <>
                            <Package /> Generar Pedido
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderCart;