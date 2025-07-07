// Se importa la librería React.
import React from 'react';

// --- Se importan los íconos necesarios desde el componente Sidebar ---
// Nota: En una aplicación más grande, sería ideal tener los íconos en su propio archivo.
// Por ahora, los definimos aquí para mantener la simplicidad.
const PointOfSaleIcon = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const InventoryIcon = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const UsersIcon = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UserProfileIcon = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;


// --- Componente de la Barra de Navegación Inferior ---
// Acepta una prop 'activeLink' para saber qué ícono resaltar.
function BottomNav({ activeLink }) {
    // El componente retorna la estructura JSX del menú inferior.
    return (
        // 'nav' es una etiqueta semántica para la navegación.
        // Se posiciona de forma fija en la parte inferior de la pantalla.
        <nav className="
      fixed bottom-0 left-0 right-0
      bg-white border-t border-pink-100
      p-4 shadow-top
      flex justify-around items-center
      // La clase 'md:hidden' oculta este componente en pantallas medianas o más grandes.
      md:hidden
    ">
            {/* Botón para 'Punto de Venta'. */}
            <button className={`p-2 rounded-full ${activeLink === 'Punto de Venta' ? 'text-pink-500' : 'text-gray-400'}`}>
                <PointOfSaleIcon />
            </button>

            {/* Botón para 'Inventario'. */}
            <button className={`p-2 rounded-full ${activeLink === 'Inventario' ? 'text-pink-500' : 'text-gray-400'}`}>
                <InventoryIcon />
            </button>

            {/* Botón para 'Gestión de Usuarios'. */}
            <button className={`p-2 rounded-full ${activeLink === 'Gestión de Usuarios' ? 'text-pink-500' : 'text-gray-400'}`}>
                <UsersIcon />
            </button>

            {/* Botón para el 'Perfil de Usuario'. */}
            <button className={`p-2 rounded-full ${activeLink === 'Perfil' ? 'text-pink-500' : 'text-gray-400'}`}>
                <UserProfileIcon />
            </button>
        </nav>
    );
}

// Se exporta el componente para su uso en otros archivos.
export default BottomNav;