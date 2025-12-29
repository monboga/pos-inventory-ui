import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes
import TrackingSearch from '../components/tracking/TrackingSearch'; // Ajusta la ruta si los pusiste en otro lado
import TrackingResult from '../components/tracking/TrackingResult';

// Servicios y Hooks
import { orderService } from '../services/orderService';

// Assets
import logoImg from '../assets/logo.png'; // Asegúrate de tener tu logo

function PublicTrackingPage() {
    // Estado del formulario
    const [searchParams, setSearchParams] = useState({ orderNumber: '', phone: '' });
    
    // Estado de la búsqueda
    const [orderResult, setOrderResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Manejadores de Inputs
    const handleOrderChange = (val) => setSearchParams(prev => ({ ...prev, orderNumber: val.toUpperCase() }));
    const handlePhoneChange = (val) => {
        const numeric = val.replace(/\D/g, '').slice(0, 10); // Solo números, max 10
        setSearchParams(prev => ({ ...prev, phone: numeric }));
    };

    // Acción de Buscar
    const handleTrack = async (e) => {
        e.preventDefault();
        if (!searchParams.orderNumber || searchParams.phone.length < 10) return;

        setLoading(true);
        setOrderResult(null);

        try {
            const data = await orderService.trackOrder(searchParams.orderNumber, searchParams.phone);
            setOrderResult(data);
        } catch (err) {
            toast.error(err.message || "No encontramos ese pedido.");
        } finally {
            setLoading(false);
        }
    };

    // Limpiar búsqueda
    const clearSearch = () => {
        setOrderResult(null);
        setSearchParams({ orderNumber: '', phone: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans selection:bg-pink-100 selection:text-pink-900 flex flex-col items-center justify-center p-4 relative">
            <Toaster position="top-center" />

            {/* Header Flotante / Logo */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-center z-10 pointer-events-none">
                <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-sm border border-white/50 pointer-events-auto">
                    <img src={logoImg} alt="ALBA POS" className="h-8 object-contain" />
                </div>
            </header>

            {/* Contenido Principal con Animación de Transición */}
            <main className="w-full max-w-4xl flex flex-col items-center z-0 pt-20">
                <AnimatePresence mode="wait">
                    {!orderResult ? (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            transition={{ duration: 0.3 }}
                            className="w-full flex justify-center"
                        >
                            <TrackingSearch 
                                params={searchParams}
                                onOrderChange={handleOrderChange}
                                onPhoneChange={handlePhoneChange}
                                onSearch={handleTrack}
                                loading={loading}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <TrackingResult 
                                order={orderResult}
                                onBack={clearSearch}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            {/* Footer sencillo */}
            <div className="mt-12 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">
                Desarrollado con ❤️ para tu negocio
            </div>
        </div>
    );
}

export default PublicTrackingPage;