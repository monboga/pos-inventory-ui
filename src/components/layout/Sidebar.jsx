// src/components/layout/Sidebar.jsx

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Package, 
    Store, 
    Users, 
    Truck, 
    ChevronLeft, 
    ChevronRight, 
    LogOut, 
    ChevronsUpDown,
    UserCircle
} from 'lucide-react';

// --- Sub-componente MenuItem con Tooltip ---
function MenuItem({ icon: Icon, text, active, isCollapsed, onClick, to }) {
    return (
        <div className="relative group">
            <Link
                to={to}
                onClick={onClick}
                className={`
                    flex items-center p-3 my-1.5 rounded-xl transition-all duration-200 
                    ${active 
                        ? "bg-pink-100 text-pink-600 shadow-sm" 
                        : "text-gray-500 hover:bg-pink-50 hover:text-pink-500"
                    } 
                    ${isCollapsed ? "justify-center" : "w-full"}
                `}
            >
                {/* El icono mantiene su tamaño */}
                <Icon size={22} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
                
                {/* SOLUCIÓN AL BUG VISUAL: Usamos 'hidden' absoluto.
                    Si está colapsado, el texto DESAPARECE del flujo, evitando que empuje cosas o se vea cortado. */}
                <span className={`ml-3 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
                    {text}
                </span>
            </Link>

            {/* --- TOOLTIP FLOTANTE (Solo visible si está colapsado + Hover) --- */}
            {isCollapsed && (
                <div className="
                    absolute left-full top-1/2 -translate-y-1/2 ml-3
                    z-50 hidden group-hover:block
                    bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-md shadow-xl
                    whitespace-nowrap animate-in fade-in zoom-in duration-200
                ">
                    {/* Flechita decorativa del tooltip */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                    {text}
                </div>
            )}
        </div>
    );
}

function Sidebar({ logoUrl }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    // Datos del usuario (ahora vendrán reales desde la API gracias al AuthContext)
    const displayName = user?.name || "Cargando...";
    const userEmail = user?.email || "";
    // Iniciales seguras
    const userInitials = user?.initials || displayName.charAt(0).toUpperCase() || "U";
    const userRole = user?.role || "Usuario"; 

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        // z-50 para asegurar que el sidebar y sus tooltips estén sobre todo
        <div className="relative h-screen hidden md:flex z-50">
            
            {/* Botón de Colapso */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
                    absolute top-9 -right-3 
                    bg-white text-gray-400 hover:text-pink-500
                    p-1 rounded-full border border-gray-100 shadow-md 
                    transition-transform duration-300 z-50
                    hover:scale-110
                `}>
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Contenedor Aside */}
            <aside className={`
                h-full bg-white border-r border-gray-100
                transition-all duration-300 ease-in-out 
                ${isCollapsed ? 'w-20' : 'w-72'} 
                flex flex-col relative
            `}>
                {/* Header */}
                <header className={`flex items-center justify-center h-24 flex-shrink-0 ${isCollapsed ? 'px-2' : 'px-6'}`}>
                    <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'h-10 w-auto'}`} 
                    />
                </header>

                {/* Navegación */}
                {/* Usamos overflow-visible cuando está colapsado para permitir que los tooltips salgan */}
                <nav className={`flex-grow px-3 py-4 space-y-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
                    
                    {/* Título de Sección (Desaparece con hidden al colapsar) */}
                    <p className={`text-xs font-bold text-gray-400 uppercase mb-2 px-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                        Menu
                    </p>
                    
                    <MenuItem to="/" text="Dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed} active={isActive('/')} />
                    <MenuItem to="/pos" text="Punto de Venta" icon={Store} isCollapsed={isCollapsed} active={isActive('/pos')} />
                    <MenuItem to="/inventory" text="Inventario" icon={Package} isCollapsed={isCollapsed} active={isActive('/inventory')} />

                    <div className="my-4 border-t border-gray-100"></div>
                    
                    <p className={`text-xs font-bold text-gray-400 uppercase mb-2 px-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                        Admin
                    </p>

                    <MenuItem to="/users" text="Usuarios" icon={Users} isCollapsed={isCollapsed} active={isActive('/users')} />
                    <MenuItem to="/suppliers" text="Proveedores" icon={Truck} isCollapsed={isCollapsed} active={isActive('/suppliers')} />
                </nav>

                {/* Footer del Usuario */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/50 mt-auto">
                    <div className={`
                        relative flex items-center p-2 rounded-xl cursor-pointer transition-colors hover:bg-white hover:shadow-sm
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                            {userInitials}
                        </div>

                        {/* Texto del Usuario (Oculto con hidden para evitar el bug) */}
                        <div className={`ml-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                            <p className="text-sm font-bold text-gray-700 truncate max-w-[140px]">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{userRole}</p>
                        </div>

                        {/* Icono Flechas */}
                        {!isCollapsed && (
                            <ChevronsUpDown size={16} className="ml-auto text-gray-400" />
                        )}
                    </div>

                    {/* Menú Popup (Dropdown) */}
                    {isUserMenuOpen && (
                        <div className={`
                            absolute bottom-20 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 w-64 z-[60]
                            ${isCollapsed ? 'left-16' : 'left-4 right-4 w-auto'}
                            origin-bottom-left animate-in fade-in slide-in-from-bottom-2 duration-200
                        `}>
                            <div className="px-3 py-3 border-b border-gray-100 mb-1 bg-gray-50 rounded-t-lg">
                                <p className="text-sm font-bold text-gray-800">{displayName}</p>
                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                            </div>
                            
                            <Link to="/profile" className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors">
                                <UserCircle size={16} className="mr-2" />
                                Mi Perfil
                            </Link>
                            
                            <button 
                                onClick={handleLogout} 
                                className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1"
                            >
                                <LogOut size={16} className="mr-2" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default Sidebar;