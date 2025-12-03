// src/pages/CustomersPage.jsx
import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Search, Plus, Phone, Mail, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react';

// Datos de ejemplo (Mock Data)
const MOCK_CUSTOMERS = [
    { id: 1, name: "Ana García", email: "ana.garcia@gmail.com", phone: "555-0123", location: "Monterrey, NL", totalPurchases: 12, lastPurchase: "2023-11-20" },
    { id: 2, name: "Carlos López", email: "carlos.lpz@hotmail.com", phone: "555-8899", location: "Guadalupe, NL", totalPurchases: 5, lastPurchase: "2023-12-01" },
    { id: 3, name: "Empresa ABC S.A.", email: "compras@abc.com", phone: "818-2222", location: "San Pedro, NL", totalPurchases: 45, lastPurchase: "2023-12-03" },
    { id: 4, name: "Maria Rodriguez", email: "mary.rod@outlook.com", phone: "555-4567", location: "Apodaca, NL", totalPurchases: 2, lastPurchase: "2023-10-15" },
];

function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    // Filtrado simple por nombre o email
    const filteredCustomers = MOCK_CUSTOMERS.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Encabezado con Botón de Acción */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <PageHeader title="Clientes" subtitle="Gestiona tu base de datos de clientes" />
                <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                    <Plus size={20} />
                    <span>Nuevo Cliente</span>
                </button>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre, correo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabla de Clientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="p-4 rounded-tl-2xl">Cliente</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4">Ubicación</th>
                                <th className="p-4 text-center">Compras</th>
                                <th className="p-4 text-right rounded-tr-2xl">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-pink-50/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{customer.name}</div>
                                        <div className="text-xs text-gray-400">ID: #{customer.id.toString().padStart(4, '0')}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Mail size={14} className="text-pink-400" />
                                            {customer.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone size={14} className="text-pink-400" />
                                            {customer.phone}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin size={14} className="text-gray-400" />
                                            {customer.location}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                            {customer.totalPurchases}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1">Última: {customer.lastPurchase}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Estado vacío si no hay resultados */}
                {filteredCustomers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron clientes que coincidan con tu búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomersPage;