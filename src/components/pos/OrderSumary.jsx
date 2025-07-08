// src/components/pos/OrderSummary.jsx

// Se importan los hooks de React para manejar estado y efectos.
import React, { useState, useEffect } from 'react';

// Se define el componente para el resumen del pedido.
// Ahora acepta las funciones 'onUpdateQuantity' y 'onRemoveItem' como props.
function OrderSummary({ cartItems, onUpdateQuantity, onRemoveItem }) {
    // Se definen los estados para los cálculos del total.
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    // Estado local para el método de pago seleccionado.
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    // Se define una tasa de impuesto fija (16% en este caso).
    const TAX_RATE = 0.16;

    // Se utiliza useEffect para recalcular los totales cada vez que 'cartItems' cambie.
    useEffect(() => {
        // Se calcula el subtotal sumando el precio de todos los productos, multiplicado por su cantidad.
        const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTax = newSubtotal * TAX_RATE;
        const newTotal = newSubtotal + newTax;

        // Se actualizan los estados con los nuevos valores calculados.
        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newTotal);
    }, [cartItems]); // El efecto se ejecuta solo cuando 'cartItems' cambia.

    // Retorna la estructura JSX para el resumen del pedido.
    return (
        // Contenedor principal con fondo blanco y estilos de tarjeta.
        <div className="bg-white rounded-2xl h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-pink-100 pb-4">Resumen del Pedido</h2>

            {/* Contenedor de la lista de productos en el carrito. */}
            <div className="flex-grow my-4 overflow-y-auto pr-2">
                {/* Se renderiza un mensaje si el carrito está vacío. */}
                {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">No hay productos seleccionados.</p>
                ) : (
                    // Si hay productos, se mapean para mostrarlos en la lista.
                    cartItems.map((item) => (
                        <div key={item.id} className="flex items-center mb-4">
                            {/* --- INICIO DE LOS NUEVOS CONTROLES --- */}
                            {/* Contenedor para el nombre y el precio del producto. */}
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                            </div>
                            {/* Controles para aumentar/disminuir la cantidad. */}
                            <div className="flex items-center">
                                <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-pink-100 text-pink-700">-</button>
                                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-pink-100 text-pink-700">+</button>
                            </div>
                            {/* Botón para eliminar el producto del carrito. */}
                            <button onClick={() => onRemoveItem(item.id)} className="ml-4 text-gray-400 hover:text-red-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            {/* --- FIN DE LOS NUEVOS CONTROLES --- */}
                        </div>
                    ))
                )}
            </div>

            {/* Sección de totales en la parte inferior. */}
            <div className="border-t border-pink-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Impuestos (16%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-xl text-gray-800"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
            </div>

            {/* --- INICIO DEL SELECTOR DE MÉTODO DE PAGO --- */}
            <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Método de Pago</h3>
                <div className="flex space-x-2">
                    <button onClick={() => setPaymentMethod('Efectivo')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${paymentMethod === 'Efectivo' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Efectivo</button>
                    <button onClick={() => setPaymentMethod('Tarjeta')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${paymentMethod === 'Tarjeta' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Tarjeta</button>
                </div>
            </div>
            {/* --- FIN DEL SELECTOR DE MÉTODO DE PAGO --- */}

            {/* Botón principal de acción para realizar el pedido. */}
            <button className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg mt-6 hover:bg-pink-600 transition-colors">
                Realizar Pedido
            </button>
        </div>
    );
}

// Se exporta el componente.
export default OrderSummary;