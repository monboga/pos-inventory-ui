// src/components/ui/LoadingScreen.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store } from 'lucide-react'; 
import CartLoader from './CartLoader/CartLoader'; // <--- Importamos el nuevo loader

const LoadingScreen = ({ logoUrl }) => {
    const [stage, setStage] = useState(1); // 1: Logo Centro, 2: Logo Izq + Carrito Der

    useEffect(() => {
        // Esperamos 1.5s para mostrar el carrito (dando tiempo a ver el logo primero)
        const timer = setTimeout(() => {
            setStage(2);
        }, 1200); 
        return () => clearTimeout(timer);
    }, []);

    // Función para renderizar el Logo o el Fallback (Tiendita)
    const renderBrand = () => {
        if (logoUrl) {
            return (
                <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-20 w-auto object-contain drop-shadow-xl"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                />
            );
        }
        // Fallback: Icono de Tienda Blanco con Fondo Rosa (Estilo Login)
        return (
            <div className="bg-pink-500 p-4 rounded-3xl shadow-xl shadow-pink-200 text-white flex items-center justify-center">
                <Store size={48} strokeWidth={1.5} />
            </div>
        );
    };

    return (
        <motion.div
            key="global-loader"
            exit={{ opacity: 0, transition: { duration: 0.5 } }} // Salida suave al terminar carga
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
            <div className="flex items-center gap-8 md:gap-12">
                
                {/* 1. BRAND (Logo/Icono) */}
                <motion.div
                    layout // <--- Magia de Framer Motion: Anima el cambio de posición
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="flex flex-col items-center"
                >
                    {renderBrand()}
                    
                    {/* Texto inicial (desaparece en etapa 2) */}
                    <AnimatePresence>
                        {stage === 1 && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, position: 'absolute' }}
                                className="mt-4 text-gray-400 text-sm font-medium absolute top-full"
                            >
                                Iniciando...
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* 2. CART LOADER (Aparece en etapa 2) */}
                <AnimatePresence>
                    {stage === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.5 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <CartLoader />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
};

export default LoadingScreen;