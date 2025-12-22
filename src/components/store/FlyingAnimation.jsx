import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';

const FlyingAnimation = ({ items }) => (
    <AnimatePresence>
        {items.map(item => (
            <motion.div
                key={item.id}
                initial={{ opacity: 1, x: item.x, y: item.y, scale: 1 }}
                animate={{
                    x: window.innerWidth - 60,
                    y: 20,
                    scale: 0.2,
                    opacity: 0.5
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed z-[100] w-16 h-16 rounded-xl overflow-hidden shadow-xl pointer-events-none bg-white border-2 border-pink-50"
            >
                {item.img ? (
                    <img src={item.img} className="w-full h-full object-cover" alt="" />
                ) : (
                    <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                        <Package className="text-pink-500" size={32} />
                    </div>
                )}
            </motion.div>
        ))}
    </AnimatePresence>
);

export default FlyingAnimation;