import React from 'react';
import { motion } from 'framer-motion'; // Agregamos movimiento sutil
import welcomeImage from '../../assets/welcome-girl.svg';

function WelcomeBanner({ userName }) {
    return (
        <div className="bg-gradient-to-r from-pink-600 to-rose-400 rounded-3xl text-white shadow-xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center min-h-[220px]">
            
            {/* Decoración Fondo (Sutil y profesional) */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-pink-800 opacity-20 rounded-full translate-y-1/2 blur-2xl pointer-events-none"></div>

            {/* Contenedor de Texto */}
            <div className="relative z-10 flex-1 p-8 md:p-12 flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">
                        ¡Hola de nuevo, {userName}!
                    </h1>
                    <p className="text-pink-50 text-lg leading-relaxed opacity-95 max-w-xl font-light">
                        "El éxito es la suma de pequeños esfuerzos repetidos día tras día." 
                        <br/> <span className="font-semibold text-white mt-1 block">¡Rompamos récords hoy! 🚀</span>
                    </p>
                </motion.div>
                
                <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <button className="px-6 py-3 bg-white text-pink-600 font-bold rounded-xl shadow-lg hover:bg-pink-50 hover:shadow-xl transition-all transform active:scale-95 text-sm uppercase tracking-wide">
                        Ver Reportes
                    </button>
                </motion.div>
            </div>

            {/* Ilustración (Ajustada para verse profesional) */}
            <motion.div 
                className="hidden md:block relative z-10 w-72 h-full mr-4 flex-shrink-0 self-end"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Eliminamos rotaciones excesivas, mejoramos el posicionamiento */}
                <img 
                    src={welcomeImage} 
                    alt="Welcome" 
                    className="w-full h-56 object-contain drop-shadow-2xl" 
                    style={{ marginBottom: '-8px' }} // Anclaje al piso
                />
            </motion.div>
        </div>
    );
}

export default WelcomeBanner;