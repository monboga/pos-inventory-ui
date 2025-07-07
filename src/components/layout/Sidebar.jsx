// Se importa la librería React y el hook 'useState' para manejar el estado del componente.
import React, { useState } from 'react';

// --- Definición de Iconos ---
// Se definen como componentes funcionales para su fácil reutilización.
const PointOfSaleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const InventoryIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronLeftIcon = () => <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

// --- Sub-componente para los enlaces del menú ---
function MenuItem({ icon, text, active, isCollapsed }) {
    // El componente retorna una estructura de elementos JSX que serán renderizados.
    return (
        <div className="relative group">
            {/* 'div' relativo que actúa como contenedor para el tooltip. 'group' habilita estados de grupo. */}
            <a
                href="#"
                className={`
          flex items-center p-3 my-1 rounded-lg transition-colors duration-200
          ${active ? "bg-pink-100 text-pink-700" : "text-gray-600 hover:bg-pink-50"}
          ${isCollapsed ? "justify-center" : ""}
        `}
            >
                {/* Contenedor para el icono. */}
                <div>{icon}</div>
                {/* Contenedor para el texto del enlace. */}
                <span
                    // Se usa la clase 'hidden' para remover el texto del flujo del layout cuando está colapsado.
                    className={`ml-4 font-semibold whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}
                >
                    {text}
                </span>
            </a>

            {/* El tooltip se renderiza en el DOM únicamente si la barra está contraída. */}
            {isCollapsed && (
                <span className="
          absolute left-20 top-1/2 -translate-y-1/2
          px-3 py-1.5 text-sm font-medium text-white bg-pink-500 rounded-md shadow-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          whitespace-nowrap
        ">
                    {text}
                </span>
            )}
        </div>
    );
}

// --- Componente principal de la Barra Lateral ---
function Sidebar({ logoUrl }) {
    // Estado para controlar si la barra lateral está contraída.
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Estado para controlar el enlace activo.
    const [activeLink, setActiveLink] = useState('Punto de Venta');
    // Estado para el menú emergente del usuario.
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Datos del usuario (serán dinámicos en el futuro).
    const userName = "Nombre Apellido";
    const userEmail = "usuario@dominio.com";
    const userInitials = userName.split(' ').map(n => n[0]).join('');

    // El componente retorna la estructura JSX.
    return (
        <div className="relative h-screen hidden md:block">
            {/* Botón flotante para colapsar/expandir. */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
          absolute top-7 bg-white p-1.5 rounded-full border border-pink-100 shadow-md transition-all duration-300
          ${isCollapsed ? 'left-24' : 'left-72'} -translate-x-1/2
        `}
            >
                {/* El ícono cambia dependiendo del estado. */}
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>

            {/* Contenedor principal 'aside'. */}
            <aside className={`h-full bg-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'} shadow-xl flex flex-col`}>

                {/* --- INICIO DE LA CORRECCIÓN 3: Logo Más Grande y Centrado --- */}
                {/* Sección superior: Logo. Se aumenta la altura y se centra siempre. */}
                <header className={`flex items-center justify-center p-4 h-24 border-b border-pink-100`}>
                    {/* Imagen del logo. Se aumenta el tamaño cuando está expandido. */}
                    <img src={logoUrl} alt="Logo" className={`transition-all duration-300 ${isCollapsed ? 'w-10' : 'h-16 w-auto'}`} />
                </header>

                {/* Sección de navegación. */}
                <nav className="flex-grow p-2">
                    {/* Se renderiza un componente MenuItem para cada enlace. */}
                    <MenuItem text="Punto de Venta" icon={<PointOfSaleIcon />} isCollapsed={isCollapsed} active={activeLink === 'Punto de Venta'} />
                    <MenuItem text="Inventario" icon={<InventoryIcon />} isCollapsed={isCollapsed} active={activeLink === 'Inventario'} />
                    <MenuItem text="Gestión de Usuarios" icon={<UsersIcon />} isCollapsed={isCollapsed} active={activeLink === 'Gestión de Usuarios'} />
                </nav>

                {/* Sección inferior: Perfil de usuario. */}
                <footer className={`p-4 border-t border-pink-100`}>
                    {/* --- INICIO DE LA CORRECCIÓN 1 y 2: Avatar y Clic Condicional --- */}
                    {/* Contenedor del perfil. El cursor y el evento de clic ahora son condicionales. */}
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : ''}`}
                        onClick={() => {
                            // El menú emergente solo se puede abrir o cerrar si la barra está contraída.
                            if (isCollapsed) {
                                setIsUserMenuOpen(!isUserMenuOpen);
                            }
                        }}
                    >
                        {/* Se revierte al avatar con iniciales. */}
                        <div className="w-12 h-12 rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                            {userInitials}
                        </div>
                        {/* Información del usuario. */}
                        <div className={`ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
                            <p className="font-semibold">{userName}</p>
                            <span className="text-xs text-gray-500">Cuenta de Usuario</span>
                        </div>
                    </div>

                    {/* Menú emergente del perfil, renderizado condicionalmente. */}
                    {isUserMenuOpen && isCollapsed && (
                        <div className="
              absolute bottom-4 left-full ml-4 p-2
              bg-white rounded-xl shadow-lg border border-gray-100
              w-64 z-20
            ">
                            {/* Encabezado del menú emergente con el avatar de iniciales. */}
                            <div className="flex items-center p-2 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    {userInitials}
                                </div>
                                <div className="ml-3">
                                    <p className="font-bold text-gray-800">{userName}</p>
                                    <p className="text-sm text-gray-500">{userEmail}</p>
                                </div>
                            </div>

                            {/* Opciones principales del menú */}
                            <nav className="p-2">
                                <a href="#" className="block p-2 text-gray-700 text-sm font-medium rounded-md hover:bg-pink-50">Ver Perfil</a>
                                <a href="#" className="block p-2 text-gray-700 text-sm font-medium rounded-md hover:bg-pink-50">Gestionar Suscripciones</a>
                            </nav>

                            {/* Separador */}
                            <hr className="my-1 border-gray-100" />

                            {/* Opción de cerrar sesión */}
                            <div className="p-2">
                                <a href="#" className="flex items-center justify-between p-2 text-gray-700 text-sm font-medium rounded-md hover:bg-pink-50">
                                    <span>Cerrar Sesión</span>
                                    <LogoutIcon />
                                </a>
                            </div>
                        </div>
                    )}
                </footer>
            </aside>
        </div>
    );
}

// Se exporta el componente Sidebar para su uso en otros archivos.
export default Sidebar;