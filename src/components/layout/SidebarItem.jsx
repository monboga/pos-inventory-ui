import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ item, isCollapsed }) => {
    const [isHovered, setIsHovered] = useState(false);
    const hasPermission = usePermission(item.permission);

    if (item.permission && !hasPermission) return null;

    const IconComponent = item.icon;

    return (
        <div 
            className="relative px-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                    `flex items-center p-3 my-1.5 rounded-xl transition-all duration-200 
                    ${isActive 
                        ? "bg-pink-100 text-pink-600 shadow-sm"
                        : "text-gray-500 hover:bg-pink-50 hover:text-pink-500"
                    } 
                    ${isCollapsed ? "justify-center" : "w-full"}`
                }
            >
                {IconComponent && (
                    <IconComponent 
                        size={22} 
                        className="flex-shrink-0"
                    />
                )}
                
                {/* Si no está colapsado, mostramos el texto con una entrada suave */}
                {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: 0.1 }} // Pequeño delay para que no se vea el texto aplastado al abrir
                        className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                        {item.title}
                    </motion.span>
                )}
            </NavLink>

            {/* Tooltip con rebote */}
            <AnimatePresence>
                {isCollapsed && isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10, scale: 0.8 }}
                        animate={{ 
                            opacity: 1, 
                            x: 0, 
                            scale: 1,
                            transition: { type: "spring", stiffness: 300, damping: 20 }
                        }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                        className="absolute left-full top-1/2 -translate-y-1/2 pl-3 z-50 ml-0"
                    >
                        <div className="bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-md shadow-xl whitespace-nowrap relative">
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                            {item.title}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default SidebarItem;