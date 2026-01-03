import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Package, Minus, Plus, Trash2, ChevronLeft, AlertCircle } from 'lucide-react';
import { getItemFinancials } from '../../../utils/financials';

const CartItem = ({ item, onUpdateQuantity, onRemove, imgUrl }) => {
    const financials = getItemFinancials(item);
    
    // Lógica Swipe
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, -50, 0], [0, 1, 1]);
    
    const currentStock = item.stock ?? item.Stock ?? 0;
    const isMaxedOut = item.quantity >= currentStock;

    return (
        <motion.div
            layout
            style={{ x, opacity, touchAction: "pan-y" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.2, right: 0 }}
            onDragEnd={(e, info) => {
                if (info.offset.x < -100) onRemove(item.id);
            }}
            className={`bg-white p-3 rounded-2xl shadow-sm border relative group overflow-hidden touch-pan-y ${isMaxedOut ? 'border-red-100' : 'border-gray-100'}`}
        >
            {/* Fondo Swipe */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-active:opacity-100 transition-opacity md:hidden pointer-events-none">
                <div className="flex flex-col items-center"><Trash2 size={16} /><span className="text-[8px] font-bold">Soltar</span></div>
            </div>

            {/* Badge Descuento */}
            {financials.isDiscountActive && (
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[14px] font-bold text-white shadow-sm z-20 ${financials.isBulkType ? 'bg-blue-500' : 'bg-pink-500'}`}>
                    -{financials.discountPct}%
                </div>
            )}

            <div className="flex gap-3 relative z-10 bg-white/80 backdrop-blur-[1px]">
                <div className="w-20 h-20 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                    {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt="" draggable="false" /> : <Package size={24} className="text-gray-300" />}
                    {console.log(imgUrl)}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name || item.description}</h4>
                        <div className="flex justify-between items-center mt-0.5">
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Unitario: ${financials.finalPrice.toFixed(2)}</p>
                            {isMaxedOut && <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">MAX STOCK</span>}
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-400 hover:text-pink-500 transition-colors"><Minus size={12} /></button>
                            <span className="text-xs font-bold text-gray-700 w-4 text-center">{item.quantity}</span>
                            <button disabled={isMaxedOut} onClick={() => !isMaxedOut && onUpdateQuantity(item.id, 1)} className={`w-6 h-6 flex items-center justify-center rounded-md shadow-sm transition-colors ${isMaxedOut ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-400 hover:text-green-500'}`}><Plus size={12} /></button>
                        </div>
                        <div className="flex flex-col items-end">
                            {financials.isDiscountActive && <span className="text-[10px] text-gray-400 line-through">${(financials.originalPrice * item.quantity).toFixed(2)}</span>}
                            <span className={`font-bold text-base ${financials.isDiscountActive ? 'text-pink-600' : 'text-gray-900'}`}>${financials.lineTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between relative z-10">
                <button onClick={() => onRemove(item.id)} className="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider"><Trash2 size={14} /> <span>Quitar</span></button>
                <span className="md:hidden text-[9px] text-gray-300 italic flex items-center gap-1"><ChevronLeft size={10} /> Desliza para borrar</span>
                {financials.isNearDiscount && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[9px] font-bold text-blue-600 flex items-center gap-1"><AlertCircle size={10} /> Faltan {financials.minQty - item.quantity}</span>
                        <button disabled={currentStock < financials.minQty} onClick={() => onUpdateQuantity(item.id, financials.minQty - item.quantity)} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">+Agregar</button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CartItem;