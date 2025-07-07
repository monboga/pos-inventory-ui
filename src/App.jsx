// Se importa React y los componentes necesarios, incluyendo el nuevo BottomNav.
import React from 'react';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav'; // Se importa el nuevo componente.
import logo from './assets/logo.png';
import StatCard from './components/dashboard/Statcard';
import TopProductCard from './components/dashboard/TopProductCard';

// --- Iconos para las Tarjetas de Estadísticas ---
const SalesIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const RevenueIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v.01M12 18v-2m0-4a6 6 0 100-12 6 6 0 000 12z" /></svg>;

// Se define el componente funcional principal 'App'.
function App() {
  // El componente retorna la estructura JSX.
  return (
    // Contenedor principal de la aplicación.
    <div className="flex bg-pink-50 min-h-screen">

      {/* El Sidebar ahora se oculta y aparece de forma responsiva. */}
      <Sidebar logoUrl={logo} />

      {/* Contenedor para el contenido principal de la aplicación. */}
      {/* Se añade padding inferior para que el BottomNav no tape el contenido en móvil. */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Encabezado del Dashboard */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Resumen General</h1>
          <p className="text-gray-600 mt-1">Bienvenido, aquí tienes un resumen de tu actividad.</p>
        </div>

        {/* Contenedor de la cuadrícula (Grid) para las tarjetas. */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjetas de estadísticas... */}
          <StatCard title="Ventas del Mes" value="721" change="+11.5% vs mes anterior" icon={<SalesIcon />} />
          <StatCard title="Ganancias Semanales" value="$4,250.00" change="+5.8% vs semana anterior" icon={<RevenueIcon />} />
          <TopProductCard productName="Producto Estrella" sales={152} imageUrl="https://via.placeholder.com/150" />
        </div>
      </main>

      {/* El BottomNav se renderiza aquí y controla su propia visibilidad responsiva. */}
      <BottomNav activeLink="Punto de Venta" />
    </div>
  );
}

// Se exporta el componente 'App' para que pueda ser renderizado por 'main.jsx'.
export default App;