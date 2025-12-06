import React from 'react';
import { Box, Plus } from 'lucide-react';

const API_BASE_URL = 'https://localhost:7031';

function ProductCard({ product, onAddToCart }) {
    // 1. Procesamiento de la Imagen
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

    // 2. Mapeo de campos seguros (API vs Demo)
    const name = product.description || product.Description || "Sin nombre";
    const categoryName = product.categoryName || product.CategoryName || "General";
    const price = product.price || product.Price || 0;
    const stock = product.stock || product.Stock || 0;

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 group h-full"
            onClick={() => onAddToCart(product)}
        >
            {/* --- ZONA DE IMAGEN --- */}
            <div className="p-3 pb-0">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {imgUrl ? (
                        <img 
                            src={imgUrl} 
                            alt={name} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        // ESTILO "SIN IMAGEN" (Basado en tu captura)
                        <div className="flex flex-col items-center justify-center text-gray-300">
                            <Box size={48} strokeWidth={1.5} />
                        </div>
                    )}

                    {/* Badge de Stock (Opcional pero útil) */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${stock > 0 ? 'bg-white/90 text-gray-700' : 'bg-red-100 text-red-600'}`}>
                        {stock > 0 ? `${stock} pzs` : 'Agotado'}
                    </div>
                </div>
            </div>

            {/* --- INFORMACIÓN --- */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="text-xs font-bold text-pink-500 uppercase tracking-wide mb-1">
                        {categoryName}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2" title={name}>
                        {name}
                    </h3>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-lg font-extrabold text-gray-900">
                        ${Number(price).toFixed(2)}
                    </span>
                    <button className="bg-pink-50 text-pink-500 p-1.5 rounded-lg hover:bg-pink-500 hover:text-white transition-colors">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;