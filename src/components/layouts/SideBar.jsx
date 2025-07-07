// src/components/layout/Sidebar.jsx

import React, { useState } from 'react';

// --- Iconos ---
const PointOfSaleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>);
const InventoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);


function Sidebar({ logoUrl }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const userName = "Ixchel Rodriguez";

    return (
        // 👇 1. Cambiamos el color de fondo principal del sidebar
        <aside className={`h-screen bg-pink-300 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

            {/* Apartado del Logo y Botón para colapsar */}
            <div className={`flex items-center p-4 border-b border-pink-400 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <img src={logoUrl} alt="Logo" className={`h-8 ${isCollapsed ? 'hidden' : 'block'}`} />
                {/* 👇 2. Actualizamos el color del hover del botón */}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-pink-500">
                    <MenuIcon />
                </button>
            </div>

            {/* Menú de Navegación */}
            <nav className="flex-grow p-4">
                <ul className={`space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <li>
                        {/* 👇 3. Actualizamos el color del hover de los enlaces */}
                        <a href="#" className="flex items-center space-x-3 p-2 rounded-md font-medium hover:bg-pink-500 transition-colors duration-200">
                            <PointOfSaleIcon />
                            <span className={isCollapsed ? 'hidden' : 'block'}>Punto de Venta</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center space-x-3 p-2 rounded-md font-medium hover:bg-pink-500 transition-colors duration-200">
                            <InventoryIcon />
                            <span className={isCollapsed ? 'hidden' : 'block'}>Inventario</span>
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Perfil de Usuario */}
            <div className="p-4 border-t border-pink-400 mt-auto">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    {/* 👇 4. Cambiamos el color del placeholder del avatar */}
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-bold">
                        {userName.charAt(0)}
                    </div>
                    <div className={isCollapsed ? 'hidden' : 'block'}>
                        <p className="font-semibold">{userName}</p>
                        <span className="text-sm text-sky-50">Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;