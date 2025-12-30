import React from 'react';
import { Search, Phone, Hash, ArrowRight, Loader2 } from 'lucide-react';

const TrackingSearch = ({ params, onOrderChange, onPhoneChange, onSearch, loading }) => {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-10">
                <div className="inline-block p-3 bg-pink-100 rounded-2xl mb-4 text-pink-600 shadow-inner">
                    <Search size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Rastrea tu Pedido
                </h1>
                <p className="text-gray-400 font-medium px-4">
                    Ingresa tus datos para localizar tu compra en tiempo real.
                </p>
            </div>

            <form onSubmit={onSearch} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl -z-10 opacity-60" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60" />

                <div className="space-y-6">
                    {/* Input Orden */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Número de Orden
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold select-none text-sm">
                                ORD-
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="00050"
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 rounded-2xl font-mono text-lg font-bold text-gray-800 outline-none transition-all placeholder:text-gray-300"
                                value={params.orderNumber}
                                onChange={(e) => onOrderChange(e.target.value)}
                                autoFocus
                            />
                            <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        </div>
                    </div>

                    {/* Input Teléfono */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Teléfono de Contacto
                        </label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                            <input
                                type="tel"
                                maxLength={10}
                                placeholder="10 dígitos"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 rounded-2xl font-bold text-gray-800 outline-none transition-all placeholder:text-gray-300"
                                value={params.phone}
                                onChange={(e) => onPhoneChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Botón BRANDING ALBA */}
                    <button
                        type="submit"
                        disabled={loading || !params.orderNumber || params.phone.length < 10}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Buscar Pedido <ArrowRight size={18} /></>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrackingSearch;