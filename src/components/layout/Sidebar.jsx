import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Store, ChevronsUpDown, UserCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS } from '../../constants/menuConfig';
import SidebarItem from './SidebarItem';
import SidebarSubmenu from './SidebarSubmenu';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ logoUrl }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebar-collapsed');
        return savedState === 'true';
    });

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    }, [isCollapsed]);

    const handleLogout = () => { logout(); navigate('/login'); };

    const displayName = user?.name || "Cargando...";
    const userEmail = user?.email || "";
    const userInitials = user?.initials || displayName.charAt(0).toUpperCase() || "U";
    const userRole = user?.role || "Usuario";

    const sidebarVariants = {
        expanded: { width: "18rem" },
        collapsed: { width: "5rem" } 
    };

    const userMenuVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: { 
            opacity: 1, y: 0, scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 25 } 
        },
        exit: { opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.15 } }
    };

    const filteredMenu = useMemo(() => {
        if (!user) return [];
        const hasPermission = (requiredPermission) => {
            if (!requiredPermission) return true;
            return user.permissions && user.permissions.includes(requiredPermission);
        };
        const filterItems = (items) => {
            return items.reduce((acc, item) => {
                const canViewItem = hasPermission(item.permission);
                if (!canViewItem) return acc;
                if (item.submenu) {
                    const visibleChildren = filterItems(item.submenu);
                    if (visibleChildren.length === 0) return acc; 
                    acc.push({ ...item, submenu: visibleChildren });
                } else {
                    acc.push(item);
                }
                return acc;
            }, []);
        };
        return filterItems(MENU_ITEMS);
    }, [user]);

    return (
        <div className="relative h-full hidden md:flex z-50 flex-col">
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
                    absolute top-9 -right-3 
                    bg-white text-gray-400 hover:text-pink-500
                    p-1 rounded-full border border-gray-100 shadow-md 
                    z-50
                `}>
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>

            <motion.aside 
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                className="h-full bg-white border-r border-gray-100 flex flex-col relative"
            >
                {/* --- HEADER CON DROP SHADOW --- */}
                <header className={`flex items-center justify-center h-24 flex-shrink-0 ${isCollapsed ? 'px-2' : 'px-6'} relative z-10`}>
                    {logoUrl ? (
                        <motion.img
                            layout
                            src={logoUrl}
                            alt="Logo"
                            // AQUI ESTÁ EL CAMBIO: 'drop-shadow-xl' para que la imagen resalte sobre el fondo
                            className={`object-contain drop-shadow-xl transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'h-14 w-auto'}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    ) : (
                        <motion.div 
                            layout
                            // Fallback también con shadow fuerte
                            className={`bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200 ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Store size={isCollapsed ? 20 : 24} />
                        </motion.div>
                    )}
                </header>

                {/* Nav */}
                <nav className={`flex-grow py-4 space-y-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar overflow-x-hidden'}`}>
                    {filteredMenu.map((item, index) => {
                        if (item.submenu) {
                            return <SidebarSubmenu key={index} item={item} isCollapsed={isCollapsed} />;
                        }
                        return <SidebarItem key={index} item={item} isCollapsed={isCollapsed} />;
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/50 mt-auto">
                    <div className={`
                        relative flex items-center p-2 rounded-xl cursor-pointer transition-colors hover:bg-white hover:shadow-sm
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        {user?.photo ? (
                            <img
                                src={user.photo}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                                {userInitials}
                            </div>
                        )}

                        {!isCollapsed && (
                             <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                className="ml-3 overflow-hidden whitespace-nowrap"
                             >
                                <p className="text-sm font-bold text-gray-700 truncate max-w-[140px]">{displayName}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{userRole}</p>
                            </motion.div>
                        )}

                        {!isCollapsed && (
                            <ChevronsUpDown size={16} className="ml-auto text-gray-400" />
                        )}
                    </div>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div 
                                variants={userMenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`
                                    absolute bottom-20 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 w-64 z-[60]
                                    ${isCollapsed ? 'left-16' : 'left-4 right-4 w-auto'}
                                    origin-bottom-left
                                `}
                            >
                                <div className="px-3 py-3 border-b border-gray-100 mb-1 bg-gray-50 rounded-t-lg">
                                    <p className="text-sm font-bold text-gray-800">{displayName}</p>
                                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                </div>

                                <Link
                                    to="/profile"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                >
                                    <UserCircle size={16} className="mr-2" />
                                    Ver Perfil
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Cerrar Sesión
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>
        </div>
    );
};

export default Sidebar;