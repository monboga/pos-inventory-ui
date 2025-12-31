import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingUp } from 'lucide-react';

// --- FRASES DE INSPIRACIÓN ---
const INSPIRATION_QUOTES = [
    {
        text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
        highlight: "¡Vamos a romper récords hoy! 🚀"
    },
    {
        text: "La calidad de tu trabajo define la calidad de tus resultados.",
        highlight: "¡Haz que cada venta cuente! 💼"
    },
    {
        text: "El único modo de hacer un gran trabajo es amar lo que haces.",
        highlight: "¡Tu pasión es el motor del negocio! 🔥"
    },
    {
        text: "No busques clientes, busca generar relaciones leales.",
        highlight: "¡El servicio excelente es nuestra firma! ⭐"
    }
];

function WelcomeBanner({ userName, lowStockCount }) {
    const [index, setIndex] = useState(0);
    const hasAlert = lowStockCount > 0;

    // --- LÓGICA DE ROTACIÓN (Solo si no hay alertas) ---
    useEffect(() => {
        if (!hasAlert) {
            const timer = setInterval(() => {
                setIndex((prevIndex) => (prevIndex + 1) % INSPIRATION_QUOTES.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [hasAlert]);

    const currentQuote = INSPIRATION_QUOTES[index];

    return (
        <div className="bg-gradient-to-r from-pink-600 to-rose-400 rounded-3xl text-white shadow-xl shadow-pink-200/50 mb-8 relative overflow-hidden font-montserrat">
            
            {/* --- DECORACIÓN DE FONDO --- */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-800 opacity-20 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center p-8 md:p-10 gap-6">
                
                {/* IZQUIERDA: SALUDO */}
                <div className="flex-1 text-center md:text-left">
                    <motion.h1 
                        className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        ¡Hola de nuevo, {userName}!
                    </motion.h1>

                    {/* LÓGICA CONDICIONAL */}
                    <div className="h-16 relative">
                        <AnimatePresence mode="wait">
                            {hasAlert ? (
                                // --- MODO ALERTA (PRIORIDAD) ---
                                <motion.div
                                    key="alert"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col md:flex-row items-center md:items-start gap-2"
                                >
                                    <span className="bg-red-500/20 border border-red-200/30 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-sm">
                                        <AlertCircle size={14} className="text-red-200" /> Atención Requerida
                                    </span>
                                    <p className="text-pink-50 text-sm md:text-base font-medium mt-1 md:mt-0.5">
                                        Tienes productos con inventario crítico.
                                    </p>
                                </motion.div>
                            ) : (
                                // --- MODO INSPIRACIÓN ---
                                <motion.div
                                    key={`quote-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col justify-center h-full"
                                >
                                    <p className="text-pink-50 text-base md:text-lg font-light leading-snug">
                                        "{currentQuote.text}"
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* DERECHA: INDICADOR GRANDE */}
                <div className="flex-shrink-0">
                    {hasAlert ? (
                        <motion.div 
                            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[140px]"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <span className="text-4xl font-black text-white drop-shadow-md">{lowStockCount}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 mt-1">Stock Bajo</span>
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="bg-white/20 p-3 rounded-full">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold opacity-90">Todo en Orden</span>
                                <span className="text-[10px] opacity-70">Sistema Saludable</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WelcomeBanner;