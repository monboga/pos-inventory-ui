import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../pos/ProductCard';

const ProductGrid = ({ loading, products, cart, onAddToCart }) => {
    // Variantes de animación
    const gridVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
    };

    return (
        <motion.div
            variants={gridVariants}
            initial="hidden"
            animate={loading ? "hidden" : "visible"}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {loading ? (
                Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-64 bg-white animate-pulse rounded-[2rem] border border-gray-50 shadow-sm" />
                ))
            ) : (
                products.map(product => (
                    <motion.div
                        key={product.id || product.Id}
                        variants={itemVariants}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="h-full"
                    >
                        <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                            currentQty={cart.find(i => i.id === (product.id || product.Id))?.quantity || 0}
                        />
                    </motion.div>
                ))
            )}
        </motion.div>
    );
};

export default ProductGrid;