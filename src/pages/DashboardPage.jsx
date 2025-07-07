// src/pages/DashboardPage.jsx

// Se importan los componentes necesarios.
import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import StatCard from '../components/dashboard/Statcard';
import TopProductCard from '../components/dashboard/TopProductCard';
import { useAuth } from '../context/AuthContext'; // Se importa el hook de autenticación.

// Se definen los íconos para las tarjetas.
const SalesIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const RevenueIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v.01M12 18v-2m0-4a6 6 0 100-12 6 6 0 000 12z" /></svg>;

// Se define el componente funcional de la página del dashboard.
function DashboardPage({ logoUrl }) {
    // Se obtiene la información del usuario desde el contexto.
    const { user } = useAuth();

    // El componente retorna la estructura JSX.
    return (
        <div className="flex bg-pink-50 min-h-screen">
            {/* Se pasa la información del usuario y el logo al Sidebar. */}
            <Sidebar logoUrl={logoUrl} user={user} />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Resumen General</h1>
                    <p className="text-gray-600 mt-1">Bienvenido, {user?.name || 'Usuario'}.</p>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Ventas del Mes" value="721" change="+11.5% vs mes anterior" icon={<SalesIcon />} />
                    <StatCard title="Ganancias Semanales" value="$4,250.00" change="+5.8% vs semana anterior" icon={<RevenueIcon />} />
                    <TopProductCard productName="Producto Estrella" sales={152} imageUrl="https://via.placeholder.com/150" />
                </div>
            </main>
            <BottomNav activeLink="Punto de Venta" />
        </div>
    );
}

// Se exporta el componente.
export default DashboardPage;