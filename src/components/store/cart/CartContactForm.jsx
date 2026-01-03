import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Store, Truck } from 'lucide-react';

const CartContactForm = ({ contact, updateContact }) => {
    return (
        <div className="space-y-4">
            {/* Toggle Delivery */}
            <div className="flex bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-100">
                <button
                    onClick={() => updateContact('isDelivery', false)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${!contact?.isDelivery ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Store size={16} /> Recoger
                </button>
                <button
                    onClick={() => updateContact('isDelivery', true)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${contact?.isDelivery ? 'bg-white text-purple-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Truck size={16} /> A Domicilio
                </button>
            </div>

            {/* Inputs Datos */}
            <div className="space-y-3">
                <div className="flex gap-3">
                    <div className="relative flex-[1.5]">
                        <User size={14} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            placeholder="Tu Nombre"
                            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            value={contact?.name || ''}
                            onChange={e => updateContact('name', e.target.value)}
                        />
                    </div>
                    <div className="relative flex-1">
                        <Phone size={14} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            type="tel" maxLength={10} placeholder="Tel. (10)"
                            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            value={contact?.phone || ''}
                            onChange={e => updateContact('phone', e.target.value.replace(/\D/g,''))}
                        />
                    </div>
                </div>

                {/* Dirección (Animada) */}
                <AnimatePresence>
                    {contact?.isDelivery && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3 pt-1"
                        >
                            <div className="flex gap-3">
                                <div className="relative flex-[2]">
                                    <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input 
                                        placeholder="Calle y Número" 
                                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                                        value={contact?.street || ''} 
                                        onChange={e => updateContact('street', e.target.value)} 
                                    />
                                </div>
                                <input 
                                    placeholder="# Ext" 
                                    className="flex-1 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none text-center transition-all"
                                    value={contact?.externalNumber || ''} 
                                    onChange={e => updateContact('externalNumber', e.target.value)} 
                                />
                            </div>
                            <input 
                                placeholder="Colonia y Referencias" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                                value={contact?.neighborhood || ''} 
                                onChange={e => updateContact('neighborhood', e.target.value)} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CartContactForm;