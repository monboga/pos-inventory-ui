import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { orderService } from '../services/orderService';
import OrderTimeline from '../components/orders/OrderTimeline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function PublicTrackingPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleReturnAndClose = () => {
        window.close();

        // Si después de 300ms sigue abierta, es que el navegador bloqueó el close()
        setTimeout(() => {
            window.location.href = '/orders';
        }, 300);
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setOrderData(null);

        try {
            const data = await orderService.trackOrder(orderNumber, phone);
            setOrderData(data);
        } catch (err) {
            setError(true);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Clock size={16} /> Pendiente de Pago</span>;
            case 'Confirmed': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><CheckCircle size={16} /> Confirmado</span>;
            case 'Completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Package size={16} /> Entregado</span>;
            case 'Expired': return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><XCircle size={16} /> Expirado</span>;
            case 'Cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><XCircle size={16} /> Cancelado</span>;
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6">
                <button
                    onClick={handleReturnAndClose}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-500 hover:text-pink-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <ArrowLeft size={16} />
                    <span>Finalizar y Salir</span>
                </button>
            </div>
            <div className="mb-8 text-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm inline-flex mb-4 text-pink-500">
                    <Package size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Rastrear Pedido</h1>
                <p className="text-gray-500">Consulta el estatus de tu compra en tiempo real</p>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
                {!orderData ? (
                    <form onSubmit={handleTrack} className="p-8 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Número de Orden</label>
                            <input
                                type="text" required placeholder="Ej. ORD-00050"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none uppercase"
                                value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono Registrado</label>
                            <input
                                type="tel" required placeholder="El número que usaste al comprar"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                value={phone} onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-200 mt-2 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Buscando...' : <><Search size={18} /> Rastrear</>}
                        </button>
                    </form>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-0">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{orderData.orderNumber}</h2>
                                <p className="opacity-70 text-sm">Cliente: {orderData.customerName}</p>
                            </div>
                            <button onClick={() => setOrderData(null)} className="text-white/50 hover:text-white">Nueva Búsqueda</button>
                        </div>

                        <div className="bg-gray-50 border-b border-gray-100">
                            <OrderTimeline status={orderData.status} />
                        </div>

                        <div className="p-6">
                            <div className="flex justify-center mb-6">
                                {getStatusBadge(orderData.status)}
                            </div>

                            <div className="space-y-4 mb-6">
                                {orderData.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-pink-50 text-pink-500 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                                                {item.quantity}x
                                            </div>
                                            <span className="text-gray-700 font-medium">{item.productName}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">${item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-gray-500 font-medium">Total Pagado</span>
                                <span className="text-2xl font-bold text-pink-600">${orderData.total.toFixed(2)}</span>
                            </div>

                            {/* Mostrar expiración si está pendiente */}
                            {orderData.status === 'Pending' && (
                                <div className="mt-6 bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs text-center border border-yellow-100">
                                    ⚠️ Tienes 15 minutos para concretar el pago antes de que el pedido expire.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default PublicTrackingPage;