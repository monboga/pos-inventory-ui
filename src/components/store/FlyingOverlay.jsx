import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const FlyingOverlay = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <>
            {items.map(item => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 1, scale: 1, x: item.start.x, y: item.start.y, rotate: 0 }}
                    animate={{ opacity: 0.5, scale: 0.2, x: item.end.x, y: item.end.y, rotate: 15 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                    className="fixed top-0 left-0 z-[100] pointer-events-none shadow-2xl rounded-full overflow-hidden border-2 border-white bg-white"
                    style={{ width: '48px', height: '48px' }}
                >
                    {item.img ? (
                        <img 
                            src={item.img} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }} 
                        />
                    ) : null}
                    
                    <div className={`w-full h-full bg-pink-500 flex items-center justify-center text-white ${item.img ? 'hidden' : 'flex'}`}>
                        <Package size={24} strokeWidth={2.5} />
                    </div>
                </motion.div>
            ))}
        </>
    );
};

export default FlyingOverlay;