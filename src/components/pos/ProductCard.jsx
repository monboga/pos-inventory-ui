import React from 'react';
import { Box, Plus, Ban, Percent, Layers } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

function ProductCard({ product, onAddToCart, currentQty = 0 }) {
    // --- LÓGICA DE IMAGEN ---
    let imgUrl = null;
    const rawImg = product.image || product.Image;
    if (rawImg) {
        if (rawImg.includes("Uploads")) {
            const cleanPath = rawImg.replace(/\\/g, '/');
            const prefix = cleanPath.startsWith('/') ? '' : '/';
            imgUrl = `${API_BASE_URL}${prefix}${cleanPath}`;
        } else {
            imgUrl = rawImg;
        }
    }

    // --- LÓGICA DE DATOS ---
    const name = product.description || product.Description || "Sin nombre";
    const categoryName = product.categoryName || product.CategoryName || "General";
    // 1. Extracción robusta del descuento
    const discountObj = product.discount || product.Discount || product.category?.discount || product.Category?.Discount;
    
    // 2. Porcentaje
    const discountPercent = Number(
        product.discountPercentage || product.DiscountPercentage || 
        discountObj?.percentage || discountObj?.Percentage || 0
    );

    // 3. MinQuantity (Clave para distinguir Mayoreo)
    let minQty = 1;
    if (discountObj) {
        const mq = discountObj.minQuantity !== undefined ? discountObj.minQuantity : discountObj.MinQuantity;
        if (mq && mq > 0) minQty = mq;
    }

    const hasDiscount = discountPercent > 0;
    const isBulkDiscount = hasDiscount && minQty > 1; // ¿Es mayoreo?

    // 4. Precio Visual
    // Si es mayoreo, mostramos el precio regular (porque al llevar 1 no hay descuento).
    // Si es directo, mostramos el precio ya rebajado.
    const originalPrice = Number(product.price || product.Price || 0);
    const displayPrice = (!isBulkDiscount && hasDiscount)
        ? originalPrice * (1 - discountPercent / 100)
        : originalPrice;

    const stock = product.stock ?? product.Stock ?? 0;
    const isOutOfStock = stock === 0;
    const isMaxedOut = !isOutOfStock && currentQty >= stock;

    return (
        <div
            className={`
                bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all group h-full relative overflow-hidden
                ${isOutOfStock ? 'opacity-70 cursor-not-allowed grayscale' : 'hover:shadow-md hover:-translate-y-1 cursor-pointer'}
                ${isBulkDiscount ? 'hover:border-blue-300' : 'hover:border-pink-300'} 
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

            {/* --- ZONA DE IMAGEN --- */}
            <div className="p-3 pb-0 relative">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {imgUrl ? (
                        <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-300">
                            <Box size={48} strokeWidth={1.5} />
                        </div>
                    )}

                    {/* BADGE STOCK */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${stock > 0 ? 'bg-white/90 text-gray-700' : 'bg-red-100 text-red-600'}`}>
                        {stock > 0 ? `${stock} pzs` : '0 pzs'}
                    </div>

                    {/* BADGE DESCUENTO (CONSISTENTE CON INVENTARIO) */}
                    {hasDiscount && !isOutOfStock && (
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                            isBulkDiscount ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white animate-pulse-slow'
                        }`}>
                            {isBulkDiscount ? (
                                <>
                                    <Layers size={10} strokeWidth={3} /> 
                                    <span>{minQty}+ pzs: -{discountPercent}%</span>
                                </>
                            ) : (
                                <>
                                    <Percent size={10} strokeWidth={3} /> 
                                    <span>{discountPercent}% OFF</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- INFORMACIÓN --- */}
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
                        {/* Precio Tachado (Si hay descuento directo) */}
                        {!isBulkDiscount && hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-medium mb-[-2px]">
                                ${originalPrice.toFixed(2)}
                            </span>
                        )}
                        {/* Etiqueta "Precio Base" si es Mayoreo */}
                        {isBulkDiscount && (
                            <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider mb-0.5">
                                Precio Unitario
                            </span>
                        )}
                        
                        {/* Precio Principal */}
                        <span className={`text-lg font-extrabold ${hasDiscount && !isBulkDiscount ? 'text-pink-600' : 'text-gray-900'}`}>
                            ${displayPrice.toFixed(2)}
                        </span>
                    </div>

                    {/* Botón de Acción */}
                    <button
                        disabled={isOutOfStock || isMaxedOut}
                        className={`
                            w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                            ${isMaxedOut
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isBulkDiscount 
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white' 
                                    : 'bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white'
                            }
                        `}
                    >
                        {isMaxedOut ? <span className="text-[10px] font-bold">MAX</span> : <Plus size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;