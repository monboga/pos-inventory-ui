// src/pages/InventoryPage.jsx

// Se importan los hooks y componentes necesarios.
import React, { useState } from 'react';
import { products as inventoryData } from '../data/demo-data.js';
import StatCard from '../components/dashboard/StatCard';
import AddProductModal from '../components/inventory/AddProductModal';

// Se definen los íconos para las tarjetas de resumen.
const CategoryIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const ProductIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const LowStockIcon = () => <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// Se define el componente funcional de la página de Inventario.
function InventoryPage() {
    // Estado para controlar la visibilidad del modal.
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Retorna la estructura JSX de la página.
    return (
        <div className="p-8">
            {/* Encabezado de la página. */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-sm text-gray-500">Home / Inventario</p>
                    <h1 className="text-3xl font-bold text-gray-800">Resumen de Inventario</h1>
                </div>
                {/* Botón para abrir el modal de añadir producto. */}
                <button onClick={() => setIsModalOpen(true)} className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                    + Añadir Producto
                </button>
            </div>

            {/* Tarjetas de resumen. Se reutiliza el componente StatCard. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Categorías" value="7" change="Total (17 items)" icon={<CategoryIcon />} />
                <StatCard title="Total de Productos" value="230" change="Unidades en stock" icon={<ProductIcon />} />
                <StatCard title="Stock Bajo" value="12" change="Items con menos de 10 unidades" icon={<LowStockIcon />} />
            </div>

            {/* Contenedor de la tabla de inventario. */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Artículos de Inventario</h2>
                {/* Aquí iría la tabla, por ahora es un marcador de posición. */}
                <p className="text-gray-600">La tabla de inventario se implementará aquí...</p>
            </div>

            {/* Se renderiza el modal. Su visibilidad es controlada por el estado 'isModalOpen'. */}
            <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

// Se exporta el componente.
export default InventoryPage;