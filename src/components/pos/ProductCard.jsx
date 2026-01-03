import React from 'react';
import { Box, Plus, Ban, Percent, Layers } from 'lucide-react';
// IMPORTAR UTILITY FINANCIERO
import { getItemFinancials } from '../../utils/financials';

function ProductCard({ product, onAddToCart, currentQty = 0 }) {
    
    // 1. Delegar cálculos complejos al utility
    // getItemFinancials calcula precio final, si es mayoreo, porcentaje real, etc.
    const financials = getItemFinancials({ ...product, quantity: 1 }); 
    // Nota: pasamos qty 1 para ver el precio unitario base o descuento directo

    const name = product.description || "Sin nombre";
    const categoryName = product.categoryName || "General";
    const stock = product.stock || 0;
    
    const isOutOfStock = stock === 0;
    const isMaxedOut = !isOutOfStock && currentQty >= stock;

    // Variables derivadas del financials para facilitar lectura
    const { 
        isBulkType, 
        isDiscountActive, 
        discountPct, 
        finalPrice, 
        originalPrice,
        minQty 
    } = financials;

    // Lógica visual específica para la tarjeta:
    // Si es mayoreo, mostramos el precio original como principal porque el descuento aplica después.
    // Si es directo, mostramos el precio ya rebajado.
    const displayPrice = (!isBulkType && isDiscountActive) ? finalPrice : originalPrice;

    return (
        <div
            className={`
                bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all group h-full relative overflow-hidden
                ${isOutOfStock ? 'opacity-70 cursor-not-allowed grayscale' : 'hover:shadow-md hover:-translate-y-1 cursor-pointer'}
                ${isBulkType ? 'hover:border-blue-300' : 'hover:border-pink-300'} 
            `}
            onClick={(e) => {
                if (!isOutOfStock && !isMaxedOut) onAddToCart(product, e);
            }}
        >
            {/* OVERLAY AGOTADO */}
            {isOutOfStock && (
                <div className="absolute inset-0 z-10 bg-gray-50/50 flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Ban size={12} /> AGOTADO
                    </div>
                </div>
            )}

            {/* IMAGEN */}
            <div className="p-3 pb-0 relative">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {product.image ? (
                        <img src={product.image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-300">
                            <Box size={48} strokeWidth={1.5} />
                        </div>
                    )}

                    {/* BADGE STOCK */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${stock > 0 ? 'bg-white/90 text-gray-700' : 'bg-red-100 text-red-600'}`}>
                        {stock > 0 ? `${stock} pzs` : '0 pzs'}
                    </div>

                    {/* BADGE DESCUENTO */}
                    {isDiscountActive && !isOutOfStock && (
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                            isBulkType ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white animate-pulse-slow'
                        }`}>
                            {isBulkType ? (
                                <>
                                    <Layers size={10} strokeWidth={3} /> 
                                    <span>{minQty}+ pzs: -{discountPct}%</span>
                                </>
                            ) : (
                                <>
                                    <Percent size={10} strokeWidth={3} /> 
                                    <span>{discountPct}% OFF</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* INFO */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                        {categoryName}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2" title={name}>
                        {name}
                    </h3>
                </div>

                <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                        {/* Precio Tachado */}
                        {!isBulkType && isDiscountActive && (
                            <span className="text-xs text-gray-400 line-through font-medium mb-[-2px]">
                                ${originalPrice.toFixed(2)}
                            </span>
                        )}
                        {/* Etiqueta Mayoreo */}
                        {isBulkType && (
                            <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider mb-0.5">
                                Precio Unitario
                            </span>
                        )}
                        
                        {/* Precio Principal */}
                        <span className={`text-lg font-extrabold ${isDiscountActive && !isBulkType ? 'text-pink-600' : 'text-gray-900'}`}>
                            ${displayPrice.toFixed(2)}
                        </span>
                    </div>

                    <button
                        disabled={isOutOfStock || isMaxedOut}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            isMaxedOut ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                            isBulkType ? 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white' : 
                            'bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white'
                        }`}
                    >
                        {isMaxedOut ? <span className="text-[10px] font-bold">MAX</span> : <Plus size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;