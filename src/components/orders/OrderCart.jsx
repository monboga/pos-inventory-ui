import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Truck, Store, MapPin, Trash2, Plus, Minus } from 'lucide-react';
import { getItemFinancials } from '../../utils/financials'; // Asegúrate de que esta ruta sea correcta

const OrderCart = ({ 
    cart, 
    contact, 
    setContact, 
    onUpdateQuantity, 
    onRemove, 
    onRequestCheckout, 
    loading
}) => {
    // 1. CÁLCULO SEGURO DE TOTALES (Fix del error toFixed)
    const cartTotals = useMemo(() => {
        return cart.reduce((acc, item) => {
            const financials = getItemFinancials(item);
            return {
                total: acc.total + financials.lineTotal,
                count: acc.count + item.quantity
            };
        }, { total: 0, count: 0 });
    }, [cart]);

    const isDelivery = contact.isDelivery || false;

    // Helper para actualizar contacto
    const updateContact = (field, value) => {
        setContact(prev => ({ ...prev, [field]: value }));
    };

    // Validación de envío
    const canSubmit = 
        cart.length > 0 && 
        contact.name?.trim().length > 0 && 
        contact.phone?.replace(/\D/g, '').length === 10 && 
        (!isDelivery || (contact.street && contact.neighborhood));

    return (
        <div className="w-full md:w-[450px] bg-white flex flex-col shadow-2xl relative z-20 h-full border-l border-gray-100">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-pink-100 p-2 rounded-xl text-pink-600"><Sparkles size={18} /></span>
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">Tu Orden</h2>
                </div>
                <p className="text-xs text-gray-400 font-medium pl-1">{cartTotals.count} productos agregados</p>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                        <Package size={48} strokeWidth={1} className="mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Carrito Vacío</span>
                    </div>
                ) : (
                    cart.map(item => {
                        const financials = getItemFinancials(item);
                        return (
                            <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                                {/* Imagen (Placeholder si no hay) */}
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={20} className="text-gray-300" />
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.description}</h4>
                                        <span className="text-xs text-gray-500 font-medium">${financials.unitPrice.toFixed(2)} c/u</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-1 py-0.5 shadow-sm">
                                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Minus size={12} /></button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={12} /></button>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-gray-900">${financials.lineTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button onClick={() => onRemove(item.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* SECCIÓN DATOS CLIENTE + DELIVERY */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Información de Entrega</h3>
                
                {/* 1. Switch Tipo de Entrega */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-4">
                    <button
                        onClick={() => updateContact('isDelivery', false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${!isDelivery ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Store size={14} /> Recoger
                    </button>
                    <button
                        onClick={() => updateContact('isDelivery', true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${isDelivery ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Truck size={14} /> A Domicilio
                    </button>
                </div>

                {/* 2. Inputs Básicos */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Nombre del Cliente"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-500 outline-none placeholder:font-normal"
                        value={contact.name || ''}
                        onChange={e => updateContact('name', e.target.value)}
                    />
                    <input
                        type="tel"
                        maxLength={10}
                        placeholder="Teléfono (10 dígitos)"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-500 outline-none placeholder:font-normal"
                        value={contact.phone || ''}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            updateContact('phone', val);
                        }}
                    />
                </div>

                {/* 3. Inputs Dirección (Condicionales) */}
                <AnimatePresence>
                    {isDelivery && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3 space-y-3"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Calle"
                                    className="flex-[2] px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-400"
                                    value={contact.street || ''}
                                    onChange={e => updateContact('street', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="# Ext"
                                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-400"
                                    value={contact.externalNumber || ''}
                                    onChange={e => updateContact('externalNumber', e.target.value)}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Colonia / Referencias"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-400"
                                value={contact.neighborhood || ''}
                                onChange={e => updateContact('neighborhood', e.target.value)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Totales */}
            <div className="p-6 bg-white border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase">Total a Pagar</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">
                        ${cartTotals.total.toFixed(2)}
                    </span>
                </div>
                <button 
                    onClick={onRequestCheckout}
                    disabled={loading || !canSubmit}
                    className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                        canSubmit ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-200 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                >
                    {loading ? "Procesando..." : <><Package size={18} /> Generar Pedido</>}
                </button>
            </div>
        </div>
    );
};

export default OrderCart;