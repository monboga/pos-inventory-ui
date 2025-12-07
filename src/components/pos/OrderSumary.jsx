import React, { useState, useEffect } from 'react';
import { Trash2, Banknote, Loader2, CreditCard } from 'lucide-react';
import SaleConfirmationModal from '../sales/SaleConfirmationModal';
import toast from 'react-hot-toast';

function OrderSummary({ cartItems, onUpdateQuantity, onRemoveItem, onProcessSale, isProcessing, selectedClientId }) {
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const TAX_RATE = 0.16;

    useEffect(() => {
        const newSubtotal = cartItems.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return sum + (price * qty);
        }, 0);

        const newTax = newSubtotal * TAX_RATE;
        const newTotal = newSubtotal + newTax;

        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newTotal);
    }, [cartItems]);

    // Abre modal
const handleInitCheckout = () => {
        // 1. Validar Carrito Vacío
        if (cartItems.length === 0) {
            toast.error("El carrito está vacío. Agrega productos.");
            return;
        }

        // 2. Validar Cliente Seleccionado (FIX SOLICITADO)
        // Si es 0, null o undefined, detenemos el proceso y mostramos Toast
        if (!selectedClientId || selectedClientId === 0) {
            toast.error("Por favor selecciona un Cliente para cerrar la venta.", {
                icon: '⚠️', // Icono visual para reforzar
                duration: 4000
            });
            return; // <--- AQUÍ SE DETIENE, NO ABRE EL MODAL
        }

        // 3. Si todo ok, abrimos modal
        setIsModalOpen(true);
    };

    // Confirma venta y avisa al padre
    const handleConfirmCheckout = (docType) => {
        setIsModalOpen(false);
        onProcessSale(docType, total);
    };

    return (
        <div className="bg-white h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Resumen del Pedido</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">{cartItems.length} items en la orden</p>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-3">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-80">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl grayscale opacity-50">🛒</span>
                        </div>
                        <p className="text-sm font-medium">Carrito vacío</p>
                    </div>
                ) : (
                    cartItems.map((item) => {
                        const isMaxStock = item.quantity >= item.stock;
                        return (
                            <div key={item.id} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-pink-100 group">
                                {item.image && (
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 mr-3 border border-gray-100">
                                        <img src={item.image.startsWith('http') ? item.image : `https://localhost:7031/${item.image}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0 mr-2">
                                    <p className="font-bold text-gray-700 text-sm truncate leading-tight" title={item.name}>{item.name}</p>
                                    <p className="text-xs text-pink-500 font-bold mt-0.5">${Number(item.price).toFixed(2)}</p>
                                    {isMaxStock && <span className="text-[10px] text-orange-500 font-bold">Máx. stock alcanzado</span>}
                                </div>
                                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-pink-500 hover:shadow-sm font-bold transition-all">-</button>
                                    <span className="text-xs font-bold text-gray-700 w-5 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, 1)} disabled={isMaxStock} className={`w-6 h-6 flex items-center justify-center rounded-md font-bold transition-all ${isMaxStock ? 'text-gray-300 cursor-not-allowed bg-gray-100' : 'text-gray-400 hover:bg-white hover:text-pink-500 hover:shadow-sm'}`}>+</button>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500 font-medium"><span>Subtotal</span><span className="text-gray-700">${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-gray-500 font-medium"><span>Impuestos (16%)</span><span className="text-gray-700">${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-dashed border-gray-200">
                        <span className="font-bold text-lg text-gray-800">Total</span>
                        <span className="font-extrabold text-2xl text-pink-500">${total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="w-full">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200 cursor-default">
                        <Banknote size={18} /> Efectivo
                    </button>
                </div>

                {/* Botón Cerrar Venta */}
                <button
                    onClick={handleInitCheckout}
                    disabled={cartItems.length === 0 || isProcessing}
                    className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" /> Procesando...</>
                    ) : (
                        <>Cerrar Venta {total > 0 && <span>${total.toFixed(2)}</span>}</>
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