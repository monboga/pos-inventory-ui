import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/dashboard/useDashboardData';

// Componentes UI
import PageHeader from '../components/common/PageHeader';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import SummaryCard from '../components/common/SummaryCard';
import DynamicTable from '../components/common/DynamicTable';

// Iconos y Gráficos
import { ShoppingBag, DollarSign, PackageX, Layers, Activity, Star } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';


// --- COMPONENTES VISUALES ---
const DateBadge = () => {
    const currentDate = new Date();
    const dayNum = currentDate.getDate();
    const dayName = currentDate.toLocaleDateString('es-MX', { weekday: 'long' });
    const monthYear = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

    return (
        <div className="flex items-center gap-3 bg-white pl-1 pr-5 py-1.5 rounded-full shadow-sm border border-pink-100 h-fit">
            <div className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md shadow-pink-200">
                {dayNum}
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">{dayName}</span>
                <span className="text-[10px] font-semibold text-gray-400 capitalize">{monthYear}</span>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label, prefix = "$" }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 text-xs rounded-xl shadow-xl border border-pink-100 z-50">
                <p className="font-semibold mb-1 text-gray-400">{label}</p>
                <p className="font-bold text-lg text-pink-600">
                    {prefix === "$" ? `$${Number(payload[0].value).toLocaleString()}` : payload[0].value}
                    {prefix !== "$" && " pedidos"}
                </p>
            </div>
        );
    }
    return null;
};

// --- ANIMACIONES ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

function DashboardPage() {
    const { user } = useAuth();
    const { loading, kpis, chartData, lowStockProducts, topProducts } = useDashboardData();

    // Configuración Tabla Stock
    const columns = useMemo(() => [
        {
            header: "Producto",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-100">
                        <PackageX size={14} />
                    </div>
                    <span className="font-semibold text-gray-700 text-xs truncate max-w-[140px]" title={row.description}>
                        {row.description}
                    </span>
                </div>
            )
        },
        {
            header: "Stock",
            className: "text-right",
            render: (row) => {
                const stock = Number(row.stock ?? row.Stock ?? 0);
                return (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {stock === 0 ? 'Agotado' : `${stock} pzs`}
                    </span>
                );
            }
        }
    ], []);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-pink-500"></div>
                <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase animate-pulse">Cargando...</p>
            </div>
        </div>
    );

    return (
        <motion.div 
            className="p-6 md:p-8 w-full mx-auto min-h-screen bg-[#F9FAFB] overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            {/* HEADER */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader title="Mis Indicadores">
                    {/* Header children vacío */}
                </PageHeader>
                <div className="self-start md:self-auto">
                    <DateBadge />
                </div>
            </motion.div>

            {/* BANNER */}
            <motion.div variants={itemVariants}>
                <WelcomeBanner 
                    userName={user?.name?.split(' ')[0] || 'Admin'} 
                    lowStockCount={lowStockProducts.length} 
                />
            </motion.div>

            {/* KPIs */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" variants={itemVariants}>
                <SummaryCard 
                    title="Venta Hoy" 
                    value={`$${kpis.todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
                    subtitle="Cierre al momento" 
                    icon={Activity} 
                    colorClass="bg-emerald-50 text-emerald-500"
                />
                <SummaryCard 
                    title="Ventas del Mes" 
                    value={`$${kpis.monthSales.toLocaleString('en-US', { minimumFractionDigits: 0 })}`} 
                    subtitle="Acumulado mensual" 
                    icon={DollarSign} 
                    colorClass="bg-pink-100 text-pink-600"
                />
                <SummaryCard 
                    title="Pedidos (Web/App)" 
                    value={kpis.monthOrders} 
                    subtitle="Confirmados este mes" 
                    icon={ShoppingBag} 
                    colorClass="bg-rose-50 text-rose-500"
                />
                <SummaryCard 
                    title="Ticket Promedio" 
                    value={`$${kpis.ticketAverage.toFixed(0)}`} 
                    subtitle="Valor por venta" 
                    icon={Layers} 
                    colorClass="bg-purple-50 text-purple-500"
                />
            </motion.div>

            {/* GRID GRÁFICAS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* IZQUIERDA: GRÁFICAS DE BARRAS/AREA */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* 1. VENTAS */}
                    <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 h-[350px]" variants={itemVariants}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Ingresos Semanales</h3>
                                <p className="text-xs text-gray-400 font-medium">Ventas en tienda (POS)</p>
                            </div>
                            <div className="bg-pink-50 text-pink-500 p-2 rounded-xl"><DollarSign size={20}/></div>
                        </div>
                        <div className="h-[240px] w-full">
                            {/* FIX FREEZE: debounce={300} espera 300ms tras el resize para redibujar */}
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <BarChart data={chartData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#fbcfe8" stopOpacity={0.6}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Montserrat' }} dy={10} />
                                    <Tooltip cursor={{ fill: '#fdf2f8' }} content={<CustomTooltip />} />
                                    <Bar dataKey="ventas" fill="url(#barGradient)" radius={[6, 6, 6, 6]} barSize={32} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* 2. PEDIDOS */}
                    <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 h-[320px]" variants={itemVariants}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Flujo de Pedidos</h3>
                                <p className="text-xs text-gray-400 font-medium">Órdenes confirmadas por día</p>
                            </div>
                            <div className="bg-rose-50 text-rose-500 p-2 rounded-xl"><ShoppingBag size={20}/></div>
                        </div>
                        <div className="h-[200px] w-full">
                            {/* FIX FREEZE: debounce={300} */}
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Montserrat' }} dy={10} />
                                    <Tooltip content={<CustomTooltip prefix="#" />} />
                                    <Area type="monotone" dataKey="pedidos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorPedidos)" animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* DERECHA: TOPS & STOCK */}
                <div className="space-y-8">
                    
                    {/* 3. PASTEL */}
                    <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center relative" variants={itemVariants}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 self-start w-full flex items-center gap-2">
                             <Star size={18} className="text-yellow-400 fill-yellow-400"/> Top Categorías
                        </h3>
                        <div className="h-[220px] w-full relative">
                            {/* FIX FREEZE: debounce={300} */}
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <PieChart>
                                    <Pie data={topProducts} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" cornerRadius={5} stroke="none">
                                        {topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'Montserrat' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                <span className="text-3xl font-bold text-gray-800">4</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Tops</span>
                            </div>
                        </div>
                        <div className="w-full mt-4 space-y-2">
                            {topProducts.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                                        <span className="w-2 h-2 rounded-full" style={{background: item.color}}/> {item.name}
                                    </span>
                                    <span className="font-bold">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 4. STOCK */}
                    <motion.div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col h-[400px]" variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <PackageX className="text-red-500" size={20} /> Stock Bajo
                            </h3>
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                                {lowStockProducts.length}
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-hidden relative">
                            {lowStockProducts.length > 0 ? (
                                <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
                                    <DynamicTable
                                        columns={columns}
                                        data={lowStockProducts}
                                        loading={false}
                                        compact={true}
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="p-3 bg-green-50 rounded-full mb-3 text-green-500"><ShoppingBag size={24} /></div>
                                    <p className="text-xs text-gray-400">Inventario Saludable</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default DashboardPage;