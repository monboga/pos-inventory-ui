import React, { useState, useEffect } from 'react';
import { Trash2, Banknote, Loader2, Sparkles, AlertCircle, Layers, Percent } from 'lucide-react';
import SaleConfirmationModal from '../sales/SaleConfirmationModal';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

function OrderSummary({ cartItems, onUpdateQuantity, onRemoveItem, onProcessSale, isProcessing, selectedClientId }) {
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const TAX_RATE = 0.16;

    // --- 1. LÓGICA FINANCIERA (Igual que antes) ---
    const getItemFinancials = (item) => {
        const originalPrice = Number(item.price || item.Price) || 0;
        const discountPct = Number(item.discountPercentage || item.DiscountPercentage) || 0;
        const quantity = Number(item.quantity) || 0;
        const minQty = Number(item.minQuantity || item.MinQuantity) || 1;

        const isDiscountActive = discountPct > 0 && quantity >= minQty;
        const isBulkType = minQty > 1; // True = Mayoreo (Azul), False = Directo (Rosa)

        const finalUnitPrice = isDiscountActive
            ? originalPrice * (1 - discountPct / 100)
            : originalPrice;

        return {
            originalPrice,
            finalUnitPrice,
            total: finalUnitPrice * quantity,
            savings: (originalPrice - finalUnitPrice) * quantity,
            isDiscountActive,
            minQty,
            discountPct,
            isBulkType,
            isNearDiscount: discountPct > 0 && !isDiscountActive && (minQty - quantity <= 2)
        };
    };

    // --- 2. CÁLCULOS ---
    useEffect(() => {
        let newSubtotal = 0;
        let newSavings = 0;

        cartItems.forEach(item => {
            const financials = getItemFinancials(item);
            newSubtotal += financials.total;
            newSavings += financials.savings;
        });

        const newTax = newSubtotal * TAX_RATE;
        const newTotal = newSubtotal + newTax;

        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newTotal);
        setTotalSavings(newSavings);
    }, [cartItems]);

    // --- 3. HANDLERS ---
    const handleInitCheckout = () => {
        if (cartItems.length === 0) {
            toast.error("El carrito está vacío.");
            return;
        }
        if (!selectedClientId || selectedClientId === 0) {
            toast.error("Selecciona un Cliente.");
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmCheckout = (docType) => {
        setIsModalOpen(false);
        onProcessSale(docType, total);
    };

    return (
        <div className="bg-white h-full flex flex-col">
            
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white z-10 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Orden Actual</h2>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{cartItems.length} items agregados</p>
                </div>
                {/* Badge de Ahorro Total (Discreto y elegante) */}
                {totalSavings > 0 && (
                    <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-2">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Ahorro</span>
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                            <Sparkles size={12} fill="currentColor" /> ${totalSavings.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            {/* LISTA DE ITEMS */}
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-3 bg-gray-50/30">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <span className="text-4xl grayscale opacity-30">🛒</span>
                        </div>
                        <p className="text-sm font-medium">Carrito vacío</p>
                        <p className="text-xs mt-1">Escanea o selecciona productos</p>
                    </div>
                ) : (
                    cartItems.map((item) => {
                        const isMaxStock = item.quantity >= (item.stock || item.Stock);
                        const { originalPrice, finalUnitPrice, isDiscountActive, minQty, discountPct, isNearDiscount, isBulkType, savings } = getItemFinancials(item);

                        let imgUrl = null;
                        const rawImg = item.image || item.Image;
                        if (rawImg) {
                            if (rawImg.includes("Uploads")) {
                                const cleanPath = rawImg.replace(/\\/g, '/');
                                const prefix = cleanPath.startsWith('/') ? '' : '/';
                                imgUrl = `${API_BASE_URL}${prefix}${cleanPath}`;
                            } else imgUrl = rawImg;
                        }

                        // Lógica visual: Azul (Mayoreo) vs Rosa (Oferta)
                        const themeColorText = isBulkType ? 'text-blue-600' : 'text-pink-600';
                        const themeBg = isBulkType ? 'bg-blue-500' : 'bg-pink-500';
                        // Borde activo más sutil para minimalismo
                        const borderClass = isDiscountActive 
                            ? (isBulkType ? 'border-blue-200 shadow-sm' : 'border-pink-200 shadow-sm') 
                            : 'border-gray-100 hover:border-gray-200 hover:shadow-sm';

                        return (
                            <div key={item.id || item.Id} 
                                className={`flex flex-col p-3 bg-white rounded-2xl border transition-all duration-200 group relative overflow-hidden ${borderClass}`}
                            >
                                <div className="flex items-center">
                                    {/* IMAGEN */}
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 mr-3 border border-gray-100 relative">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Layers size={16}/></div>
                                        )}
                                        
                                        {/* Tira inferior de color si hay descuento */}
                                        {isDiscountActive && (
                                            <div className={`absolute bottom-0 left-0 right-0 h-3 ${themeBg} flex items-center justify-center`}>
                                                <span className="text-[8px] font-bold text-white flex items-center gap-0.5 leading-none">
                                                    {isBulkType ? <Layers size={7} /> : <Percent size={7} />} 
                                                    -{discountPct}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-grow min-w-0 mr-2">
                                        <p className="font-bold text-gray-700 text-sm truncate leading-tight mb-1" title={item.description}>
                                            {item.description || item.name}
                                        </p>
                                        
                                        <div className="flex flex-col">
                                            {isDiscountActive ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400 line-through decoration-gray-300">
                                                        ${originalPrice.toFixed(2)}
                                                    </span>
                                                    <span className={`text-sm font-black flex items-center gap-1 ${themeColorText}`}>
                                                        ${finalUnitPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-bold text-gray-600">
                                                    ${originalPrice.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONTROLES */}
                                    <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                                        <button onClick={() => onUpdateQuantity(item.id || item.Id, -1)} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm font-bold transition-all">-</button>
                                        <span className="text-xs font-extrabold text-gray-700 w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id || item.Id, 1)} disabled={isMaxStock} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-green-600 hover:shadow-sm font-bold transition-all disabled:opacity-30">+</button>
                                    </div>

                                    {/* ELIMINAR */}
                                    <button onClick={() => onRemoveItem(item.id || item.Id)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-xl">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* AVISOS / NUDGES */}
                                {isNearDiscount && (
                                    <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-1.5 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold">
                                            <AlertCircle size={12} />
                                            <span>Faltan {minQty - item.quantity} para -{discountPct}%</span>
                                        </div>
                                        <button onClick={() => onUpdateQuantity(item.id || item.Id, minQty - item.quantity)} className="text-[9px] bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded shadow-sm hover:bg-amber-100 transition-colors font-bold uppercase">
                                            Agregar
                                        </button>
                                    </div>
                                )}
                                
                                {isDiscountActive && (
                                    <div className="mt-1.5 flex items-center justify-between pl-1">
                                        <div className={`flex items-center gap-1 ${themeColorText}`}>
                                            {isBulkType ? <Layers size={10} strokeWidth={2.5}/> : <Percent size={10} strokeWidth={2.5}/>}
                                            <span className="text-[9px] font-bold uppercase tracking-wider">
                                                {isBulkType ? 'Precio Mayoreo' : 'Oferta'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-400">
                                            Ahorro: ${savings.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                        <span>Subtotal</span>
                        <span className="text-gray-700 font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                        <span>Impuestos (16%)</span>
                        <span className="text-gray-700">${tax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-dashed border-gray-200">
                        <span className="font-bold text-lg text-gray-800">Total</span>
                        <div className="text-right">
                            {/* TOTAL EN ROSA ALBA */}
                            <span className="font-black text-3xl text-pink-600 tracking-tight">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* BOTÓN MÉTODOS PAGO (Referencia) */}
                <div className="w-full">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-200 cursor-default">
                        <Banknote size={18} /> Efectivo
                    </button>
                </div>

                {/* BOTÓN PROCESAR VENTA (ROSA ALBA) */}
                <button
                    onClick={handleInitCheckout}
                    disabled={cartItems.length === 0 || isProcessing}
                    className="group w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" /> Procesando...</>
                    ) : (
                        <>Procesar Venta</>
                    )}
                </button>
            </div>

            <SaleConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmCheckout}
            />
        </div>
    );
}

export default OrderSummary;