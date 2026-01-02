import React from 'react';
import { motion } from 'framer-motion';

const BusinessCardSection = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`bg-white rounded-2xl shadow-sm border border-pink-100 overflow-visible ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default BusinessCardSection;