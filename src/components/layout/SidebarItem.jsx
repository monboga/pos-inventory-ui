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
            {/* Elemento Principal del Sidebar */}
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
                {IconComponent && <IconComponent size={22} className="flex-shrink-0" />}
                
                {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: 0.1 }}
                        className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                        {item.title}
                    </motion.span>
                )}
            </NavLink>

            {/* POPUP: Ahora con diseño y lógica de submenú */}
            <AnimatePresence>
                {isCollapsed && isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                        className="absolute left-full top-0 pl-3 z-50 w-56"
                    >
                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
                            {/* Encabezado igual a SidebarSubmenu */}
                            <div className="px-4 py-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-50 mb-1">
                                {item.title}
                            </div>
                            
                            <ul className="px-2 py-1">
                                <li>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 p-2 pl-3 text-sm transition-colors rounded-lg
                                            ${isActive
                                                ? "text-pink-600 font-bold bg-pink-50"
                                                : "text-gray-500 hover:text-pink-500 hover:bg-pink-50/50"}`
                                        }
                                    >
                                        {IconComponent && <IconComponent size={18} />}
                                        <span>Ver {item.title}</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SidebarItem;