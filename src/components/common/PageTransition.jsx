import React from 'react';
import { motion } from 'framer-motion';

// Animación: Entra suave desde abajo, sale desvaneciéndose hacia arriba
const animations = {
    initial: { opacity: 0, y: 20, scale: 0.99 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.43, 0.13, 0.23, 0.96] // Curva "líquida"
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.99,
        transition: { duration: 0.3, ease: "easeInOut" }
    }
};

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;