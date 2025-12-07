import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { saleService } from '../services/saleService';
import { productService } from '../services/productService';

import PageHeader from '../components/common/PageHeader';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import SummaryCard from '../components/common/SummaryCard';
import DynamicTable from '../components/common/DynamicTable';

import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle, PackageX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
    const [kpis, setKpis] = useState({ todaySales: 0, monthSales: 0, totalOrders: 0 });
    const [salesChartData, setSalesChartData] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    // Fecha Header
    const currentDate = new Date().toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const [salesData, productsData] = await Promise.all([
                    saleService.getAll(),
                    productService.getAll()
                ]);

                processSalesData(salesData);
                processStockData(productsData);

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const processSalesData = (sales) => {
        const now = new Date();
        const todayStr = now.toLocaleDateString();
        const currentMonth = now.getMonth();

        const todayTotal = sales
            .filter(s => new Date(s.registrationDate).toLocaleDateString() === todayStr)
            .reduce((acc, curr) => acc + curr.total, 0);
        
        const monthTotal = sales
            .filter(s => new Date(s.registrationDate).getMonth() === currentMonth)
            .reduce((acc, curr) => acc + curr.total, 0);

        setKpis({ todaySales: todayTotal, monthSales: monthTotal, totalOrders: sales.length });

        // Gráfica
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateLabel = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
            
            const daySales = sales
                .filter(s => new Date(s.registrationDate).toLocaleDateString() === d.toLocaleDateString())
                .reduce((acc, curr) => acc + curr.total, 0);

            last7Days.push({ name: dateLabel, ventas: daySales });
        }
        setSalesChartData(last7Days);
    };

    // --- FIX LÓGICA STOCK ---
    const processStockData = (products) => {
        console.log("Total productos analizados:", products.length);

        const lowStock = products.filter(p => {
            // Leemos la propiedad (soporta mayúscula/minúscula)
            const rawStock = p.stock !== undefined ? p.stock : p.Stock;
            
            // Convertimos a número. Si es null/undefined se vuelve 0.
            const qty = Number(rawStock);
            
            // Validamos: Es número válido Y es menor o igual a 5
            return !isNaN(qty) && qty <= 5;
        });
        
        // Ordenar: Primero los Agotados (0)
        const sortedLowStock = lowStock.sort((a, b) => {
            const stockA = Number(a.stock ?? a.Stock ?? 0);
            const stockB = Number(b.stock ?? b.Stock ?? 0);
            return stockA - stockB;
        });

        console.log("Productos con alerta:", sortedLowStock);
        setLowStockProducts(sortedLowStock);
    };

    const columns = useMemo(() => [
        {
            header: "Producto",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <PackageX size={16} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm truncate max-w-[150px]" title={row.description || row.Description}>
                        {row.description || row.Description}
                    </span>
                </div>
            )
        },
        {
            header: "Stock",
            className: "text-center",
            render: (row) => {
                const stockVal = Number(row.stock !== undefined ? row.stock : row.Stock);
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${stockVal === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {stockVal}
                    </span>
                );
            }
        },
        {
            header: "Estado",
            className: "text-right",
            render: (row) => {
                const stockVal = Number(row.stock !== undefined ? row.stock : row.Stock);
                return stockVal === 0 
                    ? <span className="text-xs text-red-500 font-bold">Agotado</span> 
                    : <span className="text-xs text-orange-500 font-bold">Bajo</span>;
            }
        }
    ], []);

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
            
            {/* Header con Fecha */}
            <PageHeader title="Dashboard">
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Hoy es</p>
                    <p className="text-sm font-bold text-gray-700 capitalize">{formattedDate}</p>
                </div>
            </PageHeader>

            <WelcomeBanner userName={user?.name?.split(' ')[0] || 'Admin'} />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Ventas de Hoy" value={`$${kpis.todaySales.toFixed(2)}`} subtitle={new Date().toLocaleDateString()} icon={DollarSign} colorClass="bg-green-100 text-green-600" />
                <SummaryCard title="Ventas del Mes" value={`$${kpis.monthSales.toFixed(2)}`} subtitle="Acumulado mensual" icon={TrendingUp} colorClass="bg-pink-100 text-pink-600" />
                <SummaryCard title="Total Pedidos" value={kpis.totalOrders} subtitle="Histórico total" icon={ShoppingBag} colorClass="bg-blue-100 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfica */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-pink-500"/>
                        Comportamiento de Ventas (7 días)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                                <Tooltip cursor={{fill: '#FCE7F3'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="ventas" name="Ventas ($)" fill="#EC4899" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabla de Alertas */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[420px]">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-orange-500"/>
                                Alertas de Stock
                            </h3>
                            <p className="text-xs text-gray-400">Menos de 5 piezas</p>
                        </div>
                        {lowStockProducts.length > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                {lowStockProducts.length}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-auto p-0">
                        {lowStockProducts.length > 0 ? (
                            <DynamicTable 
                                columns={columns} 
                                data={lowStockProducts} 
                                loading={false} 
                                pagination={{ currentPage: 1, totalPages: 1 }} 
                                onPageChange={()=>{}}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <ShoppingBag className="text-green-500" size={24}/>
                                </div>
                                <p className="text-sm font-medium">Inventario Saludable</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;