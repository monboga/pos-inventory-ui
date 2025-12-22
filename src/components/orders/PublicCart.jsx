import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Minus, Plus, ShoppingBag, Percent, Layers, Sparkles, AlertCircle } from 'lucide-react';

const PublicCart = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }) => {

    // Esta función replica la lógica del Backend para mostrar descuentos en tiempo real
    const getItemFinancials = (item) => {
        // Normalización de datos del payload
        const price = Number(item.price || item.Price || 0);
        const qty = Number(item.quantity || 0);

        // El descuento puede venir anidado según el payload visto
        const discountObj = item.discount || item.Discount;
        const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
        const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);

        // Identificadores de tipo de beneficio
        const isBulkType = minQty > 1; // True = Azul (Mayoreo), False = Rosa (Oferta)

        // REGLA DE ORO: Solo se activa si la cantidad actual cubre el mínimo
        const isDiscountActive = discountPct > 0 && qty >= minQty;

        const finalUnitPrice = isDiscountActive
            ? price * (1 - discountPct / 100)
            : price;

        return {
            originalPrice: price,
            finalPrice: finalUnitPrice,
            lineTotal: finalUnitPrice * qty,
            savings: (price - finalUnitPrice) * qty,
            isDiscountActive,
            isBulkType,
            discountPct,
            minQty,
            // Feedback de proximidad: Faltan pocos para el descuento
            isNearDiscount: isBulkType && !isDiscountActive && (minQty - qty <= 2)
        };
    };

    // Totales del Carrito
    const totals = cart.reduce((acc, item) => {
        const fin = getItemFinancials(item);
        acc.subtotal += fin.lineTotal;
        acc.totalSavings += fin.savings;
        acc.count += item.quantity;
        return acc;
    }, { subtotal: 0, totalSavings: 0, count: 0 });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col border-l border-gray-100"
                    >
                        {/* HEADER */}
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="font-black text-xl text-gray-900 tracking-tight text-pink-500">Tu Pedido</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {totals.count} Insumos seleccionados
                                </p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        {/* LISTA DE PRODUCTOS */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                    <Package size={48} className="opacity-20 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">El carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const fin = getItemFinancials(item);
                                    const themeColor = fin.isBulkType ? 'blue' : 'pink';

                                    return (
                                        <motion.div layout key={item.id} className={`flex flex-col bg-white p-4 rounded-[2rem] border transition-all relative overflow-hidden ${fin.isDiscountActive ? (fin.isBulkType ? 'border-blue-200 shadow-sm' : 'border-pink-200 shadow-sm') : 'border-gray-100 shadow-sm'}`}>

                                            {/* BADGE DE DESCUENTO ACTIVO */}
                                            {fin.isDiscountActive && (
                                                <div className={`absolute top-0 right-12 px-3 py-1 rounded-b-xl text-[8px] font-black text-white shadow-sm ${fin.isBulkType ? 'bg-blue-500' : 'bg-pink-500'} animate-in fade-in slide-in-from-top-1`}>
                                                    -{fin.discountPct}% {fin.isBulkType ? 'MAYOREO' : 'OFERTA'}
                                                </div>
                                            )}

                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 text-gray-300">
                                                    {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <Package size={20} />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xs text-gray-800 truncate pr-6">{item.name || item.description}</h4>

                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <span className={`font-black text-sm ${fin.isDiscountActive ? (fin.isBulkType ? 'text-blue-600' : 'text-pink-600') : 'text-gray-900'}`}>
                                                            ${fin.lineTotal.toFixed(2)}
                                                        </span>
                                                        {fin.isDiscountActive && (
                                                            <span className="text-[10px] text-gray-300 line-through">
                                                                ${(fin.originalPrice * item.quantity).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-400">Unit: ${fin.finalPrice.toFixed(2)}</span>
                                                </div>

                                                {/* CONTROLES */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-100 shadow-inner">
                                                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-400 hover:text-red-500 transition-all active:scale-90"><Minus size={12} /></button>
                                                        <span className="text-[11px] font-black w-3 text-center text-gray-700">{item.quantity}</span>
                                                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-400 hover:text-green-500 transition-all active:scale-90"><Plus size={12} /></button>
                                                    </div>
                                                    <button onClick={() => onRemove(item.id)} className="text-[9px] font-black text-gray-300 hover:text-rose-500 uppercase tracking-widest transition-colors">Eliminar</button>
                                                </div>
                                            </div>

                                            {/* FEEDBACK DE PROXIMIDAD (NUDGE AZUL) */}
                                            {fin.isNearDiscount && (
                                                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-2 flex items-center justify-between animate-in slide-in-from-top-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] text-blue-700 font-bold leading-none uppercase tracking-tighter">
                                                        <AlertCircle size={12} />
                                                        <span>Faltan {fin.minQty - item.quantity} pzs para aplicar -{fin.discountPct}% de mayoreo</span>
                                                    </div>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, fin.minQty - item.quantity)}
                                                        className="text-[8px] bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded-lg shadow-sm font-black uppercase tracking-wider transition-all hover:bg-blue-100"
                                                    >
                                                        Completar
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* FOOTER TOTALES */}
                        <div className="p-8 border-t border-gray-50 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            {totals.totalSavings > 0 && (
                                <div className="flex justify-between items-center px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <Sparkles size={16} fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ahorro Aplicado</span>
                                    </div>
                                    <span className="text-sm font-black text-emerald-700">-${totals.totalSavings.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end px-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total del Pedido</span>
                                    <span className="text-4xl font-black text-gray-900 tracking-tighter font-mono">
                                        ${totals.subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <ShoppingBag size={40} className="text-gray-100 mb-1" />
                            </div>

                            <button
                                disabled={cart.length === 0}
                                onClick={onCheckout}
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-pink-200 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex justify-center items-center gap-3 mt-4"
                            >
                                Registrar Pedido <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PublicCart;