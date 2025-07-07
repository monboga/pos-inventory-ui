// Se importa la librería React y el hook 'useState' para manejar el estado del componente.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- Definición de Iconos ---
// Se añade un nuevo ícono para Proveedores.
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const InventoryIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const PointOfSaleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SuppliersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronLeftIcon = () => <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const UpDownIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;


// --- Sub-componente para los enlaces del menú ---
function MenuItem({ icon, text, active, isCollapsed, onClick }) {
    // El componente retorna una estructura de elementos JSX que serán renderizados.
    return (
        <div className="relative group">
            {/* Se cambia 'a' por 'button' para mejor semántica en acciones dentro de la app. */}
            <button
                onClick={onClick} // Se asigna la función onClick recibida.
                className={`
          w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-left
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
            </button>

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
function Sidebar({ logoUrl, user }) {
    // Se obtiene la función 'logout' del contexto de autenticación.
    const { logout } = useAuth();
    // Se utiliza el hook 'useNavigate' para la redirección.
    const navigate = useNavigate();

    // Estado para controlar si la barra lateral está contraída.
    const [isCollapsed, setIsCollapsed] = useState(false);
    // El enlace activo por defecto ahora es 'Dashboard'.
    const [activeLink, setActiveLink] = useState('Dashboard');
    // Estado para el menú emergente del usuario.
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Función para manejar el cierre de sesión.
    const handleLogout = () => {
        // Se llama a la función de logout del contexto.
        logout();
        // Se redirige al usuario a la página de inicio de sesión.
        navigate('/login');
    };

    // Se usan los datos del objeto 'user' o valores por defecto si no existe.
    const userName = user?.name || "Usuario";
    const userEmail = user?.email || "email@ejemplo.com";
    const userInitials = user?.initials || "U";

    // Se calculan las clases de posición del menú emergente de forma dinámica.
    const popupMenuClasses = isCollapsed
        ? 'bottom-4 left-full ml-4' // Posición cuando está contraído.
        : 'bottom-24 left-4 right-4'; // Posición cuando está expandido.

    // El componente retorna la estructura JSX.
    return (
        <div className="relative h-screen hidden md:block">
            {/* Botón flotante para colapsar/expandir. */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
          absolute top-7 bg-white p-1.5 rounded-full border border-pink-100 shadow-md transition-all duration-300
          ${isCollapsed ? 'left-24' : 'left-72'} -translate-x-1/2 z-30
        `}
            >
                {/* El ícono cambia dependiendo del estado. */}
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>

            {/* Contenedor principal 'aside'. */}
            <aside className={`h-full bg-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'} shadow-xl flex flex-col`}>

                {/* Sección superior: Logo. */}
                <header className={`flex items-center justify-center p-4 h-24 border-b border-pink-100`}>
                    {/* Imagen del logo. */}
                    <img src={logoUrl} alt="Logo" className={`transition-all duration-300 ${isCollapsed ? 'w-10' : 'h-16 w-auto'}`} />
                </header>

                {/* --- INICIO DE LA ACTUALIZACIÓN --- */}
                {/* Sección de navegación principal con los nuevos elementos. */}
                <nav className="flex-grow p-2">
                    <MenuItem
                        text="Dashboard"
                        icon={<DashboardIcon />}
                        isCollapsed={isCollapsed}
                        active={activeLink === 'Dashboard'}
                        onClick={() => setActiveLink('Dashboard')}
                    />
                    <MenuItem
                        text="Inventario"
                        icon={<InventoryIcon />}
                        isCollapsed={isCollapsed}
                        active={activeLink === 'Inventario'}
                        onClick={() => setActiveLink('Inventario')}
                    />
                    <MenuItem
                        text="Punto de venta"
                        icon={<PointOfSaleIcon />}
                        isCollapsed={isCollapsed}
                        active={activeLink === 'Punto de venta'}
                        onClick={() => setActiveLink('Punto de venta')}
                    />
                    <MenuItem
                        text="Usuarios"
                        icon={<UsersIcon />}
                        isCollapsed={isCollapsed}
                        active={activeLink === 'Usuarios'}
                        onClick={() => setActiveLink('Usuarios')}
                    />
                    <MenuItem
                        text="Proveedores"
                        icon={<SuppliersIcon />}
                        isCollapsed={isCollapsed}
                        active={activeLink === 'Proveedores'}
                        onClick={() => setActiveLink('Proveedores')}
                    />
                </nav>
                {/* --- FIN DE LA ACTUALIZACIÓN --- */}

                {/* Sección inferior: Perfil de usuario. */}
                <footer className={`p-4 border-t border-pink-100`}>
                    {/* Contenedor del perfil. */}
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : ''}`}
                        onClick={() => {
                            if (isCollapsed) {
                                setIsUserMenuOpen(!isUserMenuOpen);
                            }
                        }}
                    >
                        {/* Avatar del usuario. */}
                        <div className="w-12 h-12 rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                            {userInitials}
                        </div>
                        {/* Información del usuario. */}
                        <div className={`ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
                            <p className="font-semibold">{userName}</p>
                            <span className="text-xs text-gray-500">Cuenta de Usuario</span>
                        </div>
                        {/* Botón para desplegar el menú en la vista expandida. */}
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`ml-auto p-1.5 rounded-full hover:bg-gray-100 ${isCollapsed ? 'hidden' : 'block'}`}
                        >
                            <UpDownIcon />
                        </button>
                    </div>

                    {/* Menú emergente del perfil. */}
                    {isUserMenuOpen && (
                        <div className={`
              absolute p-2 bg-white rounded-xl shadow-lg border border-gray-100
              w-64 z-20
              ${popupMenuClasses}
            `}>
                            {/* Contenido del menú emergente... */}
                            <div className="p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between p-2 text-gray-700 text-sm font-medium rounded-md hover:bg-pink-50"
                                >
                                    <span>Cerrar Sesión</span>
                                    <LogoutIcon />
                                </button>
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