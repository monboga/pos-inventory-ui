import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../pos/ProductCard'; // Asegúrate que esta ruta es correcta según tu proyecto

const ProductGrid = ({ loading, products, cart, onAddToCart }) => {
    
    // Configuración de animación para entrada suave
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p>No se encontraron productos.</p>
            </div>
        );
    }

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
            {products.map(product => (
                <motion.div key={product.id || product.Id} variants={itemAnim} className="h-full">
                    <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        currentQty={cart.find(i => i.id === (product.id || product.Id))?.quantity || 0}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ProductGrid;