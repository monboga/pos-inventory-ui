import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import welcomeImage from '../../assets/welcome-girl.svg';

// --- LISTA DE FRASES DE INSPIRACIÓN ---
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

function WelcomeBanner({ userName }) {
    const [index, setIndex] = useState(0);

    // --- LÓGICA DE ROTACIÓN ---
    useEffect(() => {
        // Cambia la frase cada 6 segundos
        const timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % INSPIRATION_QUOTES.length);
        }, 6000);

        return () => clearInterval(timer);
    }, []);

    const currentQuote = INSPIRATION_QUOTES[index];

    return (
        <div className="bg-gradient-to-r from-pink-600 to-rose-400 rounded-3xl text-white shadow-xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center min-h-[240px]">
            
            {/* --- DECORACIÓN DE FONDO (Sutil) --- */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-rose-800 opacity-20 rounded-full translate-y-1/2 blur-2xl pointer-events-none"></div>

            {/* --- SECCIÓN DE TEXTO (Izquierda) --- */}
            {/* FIX: 'pl-8 md:pl-12' para buen margen izquierdo, 'flex-1' para ocupar espacio disponible */}
            <div className="relative z-10 flex-1 p-8 md:p-12 flex flex-col justify-center h-full">
                
                {/* Saludo Estático */}
                <motion.h1 
                    className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    ¡Hola de nuevo, {userName}! 👋
                </motion.h1>

                {/* Frase Dinámica con AnimatePresence */}
                <div className="h-20 md:h-16 relative"> {/* Contenedor de altura fija para evitar saltos */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index} // La clave cambia para disparar la animación
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="absolute top-0 left-0 w-full"
                        >
                            <p className="text-pink-50 text-lg leading-relaxed opacity-95 font-light max-w-lg">
                                "{currentQuote.text}"
                                <br/> 
                                <span className="font-semibold text-white mt-1 block drop-shadow-sm">
                                    {currentQuote.highlight}
                                </span>
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <button className="px-6 py-2.5 bg-white text-pink-600 font-bold rounded-xl shadow-lg hover:bg-pink-50 hover:shadow-xl hover:scale-105 transition-all active:scale-95 text-sm uppercase tracking-wide">
                        Ver Reportes
                    </button>
                </motion.div>
            </div>

            {/* --- SECCIÓN DE IMAGEN (Derecha) --- */}
            {/* FIX ALINEACIÓN: Usamos 'flex items-center justify-center' y eliminamos rotaciones extrañas */}
            <motion.div 
                className="hidden md:flex relative z-10 w-1/3 h-full items-center justify-center pr-8"
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <img 
                    src={welcomeImage} 
                    alt="Welcome Illustration" 
                    // Ajustamos el tamaño máximo y usamos object-contain para que no se corte
                    className="max-h-[220px] w-auto object-contain drop-shadow-2xl" 
                />
            </motion.div>
        </div>
    );
}

export default WelcomeBanner;