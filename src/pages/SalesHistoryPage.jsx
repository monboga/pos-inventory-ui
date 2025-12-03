// src/pages/SalesHistoryPage.jsx
import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Calendar, Search, Filter, Download, Eye, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

// Datos Mock de Ventas
const MOCK_SALES = [
    { id: "VEN-1001", date: "2023-12-04 10:30", customer: "Ana García", total: 1250.00, items: 3, status: "Completado", paymentMethod: "Tarjeta" },
    { id: "VEN-1002", date: "2023-12-04 11:15", customer: "Publico General", total: 450.50, items: 1, status: "Completado", paymentMethod: "Efectivo" },
    { id: "VEN-1003", date: "2023-12-03 16:45", customer: "Carlos López", total: 2800.00, items: 5, status: "Reembolsado", paymentMethod: "Tarjeta" },
    { id: "VEN-1004", date: "2023-12-03 09:20", customer: "Empresa ABC", total: 5600.00, items: 12, status: "Completado", paymentMethod: "Transferencia" },
];

function SalesHistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");

    // Función auxiliar para estilo de badges
    const getStatusStyle = (status) => {
        switch (status) {
            case "Completado": return "bg-green-100 text-green-700 border-green-200";
            case "Reembolsado": return "bg-red-100 text-red-700 border-red-200";
            case "Pendiente": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <PageHeader title="Historial de Ventas" subtitle="Monitorea tus transacciones y rendimiento" />

            {/* Tarjetas de Resumen (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-pink-100 text-pink-600 rounded-full mr-4">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ventas de Hoy</p>
                        <h3 className="text-2xl font-bold text-gray-800">$1,700.50</h3>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <span className="font-bold mr-1">+12%</span> vs ayer
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tickets Emitidos</p>
                        <h3 className="text-2xl font-bold text-gray-800">42</h3>
                        <p className="text-xs text-gray-400 mt-1">En las últimas 24h</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ticket Promedio</p>
                        <h3 className="text-2xl font-bold text-gray-800">$450.00</h3>
                        <p className="text-xs text-green-600 mt-1">Estable</p>
                    </div>
                </div>
            </div>

            {/* Controles y Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Buscar por ID venta o cliente..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        <Calendar size={18} />
                        <span className="text-sm font-medium">Fecha</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter size={18} />
                        <span className="text-sm font-medium">Filtros</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm ml-auto md:ml-0">
                        <Download size={18} />
                        <span className="text-sm font-medium hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* Tabla de Historial */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="p-4">ID Venta</th>
                                <th className="p-4">Fecha y Hora</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4 text-center">Items</th>
                                <th className="p-4">Total</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {MOCK_SALES.map((sale) => (
                                <tr key={sale.id} className="hover:bg-pink-50/30 transition-colors">
                                    <td className="p-4 font-mono font-medium text-gray-700">{sale.id}</td>
                                    <td className="p-4 text-gray-600">{sale.date}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{sale.customer}</div>
                                        <div className="text-xs text-gray-400">{sale.paymentMethod}</div>
                                    </td>
                                    <td className="p-4 text-center text-gray-600">{sale.items}</td>
                                    <td className="p-4 font-bold text-gray-800">${sale.total.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(sale.status)}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-pink-500 hover:text-pink-700 hover:bg-pink-50 p-2 rounded-lg transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SalesHistoryPage;