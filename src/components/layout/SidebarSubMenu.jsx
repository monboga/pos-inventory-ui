import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarSubmenu = ({ item, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const ParentIcon = item.icon;

    const listVariants = {
        hidden: { 
            opacity: 0,
            height: 0,
            transition: { when: "afterChildren" }
        },
        visible: { 
            opacity: 1,
            height: "auto",
            transition: { 
                duration: 0.3,
                when: "beforeChildren", 
                staggerChildren: 0.1 
            }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { 
            x: 0, opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const popupVariants = {
        hidden: { opacity: 0, x: -10, scale: 0.95 },
        visible: { 
            opacity: 1, x: 0, scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } }
    };

    const renderSubItems = () => {
        return item.submenu.map((subItem, index) => {
            const SubIcon = subItem.icon;
            return (
                <motion.li 
                    key={index} 
                    className="mb-1"
                    variants={itemVariants} 
                >
                    <NavLink 
                        to={subItem.path}
                        className={({ isActive }) => 
                            `flex items-center gap-2 p-2 pl-3 text-sm transition-colors rounded-lg
                            ${isActive 
                                ? "text-pink-600 font-bold bg-pink-50" 
                                : "text-gray-500 hover:text-pink-500 hover:bg-pink-50/50"}`
                        }
                    >
                        {SubIcon && <SubIcon size={18} />}
                        <span>{subItem.title}</span>
                    </NavLink>
                </motion.li>
            );
        });
    };

    // --- MODO COLAPSADO (POPUP) ---
    if (isCollapsed) {
        return (
            <div 
                className="relative group px-3"
                onMouseEnter={() => setIsPopupOpen(true)}
                onMouseLeave={() => setIsPopupOpen(false)}
            >
                <div className="flex items-center justify-center p-3 my-1.5 rounded-xl text-gray-500 hover:bg-pink-50 hover:text-pink-500 cursor-pointer transition-all duration-200">
                    {ParentIcon && <ParentIcon size={22} />}
                </div>

                <AnimatePresence>
                    {isPopupOpen && (
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={popupVariants}
                            // pl-3 crea el puente invisible para que no se cierre al mover el mouse
                            className="absolute left-full top-0 pl-3 z-50 w-56" 
                        >
                            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
                                <div className="px-4 py-2 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-50 mb-1">
                                    {item.title}
                                </div>
                                <ul className="px-2 py-1 space-y-1">
                                    {renderSubItems()} 
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // --- MODO EXPANDIDO (ACORDEÓN) ---
    return (
        <div className="px-3">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center p-3 my-1.5 rounded-xl transition-all duration-200 
                ${isOpen ? "bg-gray-50 text-gray-800" : "text-gray-500 hover:bg-pink-50 hover:text-pink-500"}`}
            >
                {ParentIcon && <ParentIcon size={22} className="flex-shrink-0" />}
                
                {/* FIX: Texto controlado para no desbordar. Mismas clases de ocultamiento que SidebarItem */}
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 font-medium text-sm flex-1 text-left whitespace-nowrap overflow-hidden"
                >
                    {item.title}
                </motion.span>
                
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </button>

            <motion.ul
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
                variants={listVariants}
                className="overflow-hidden pl-4 ml-4 border-l-2 border-gray-100 space-y-1 mt-1 mb-2"
            >
                {renderSubItems()}
            </motion.ul>
        </div>
    );
};
export default SidebarSubmenu;