import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag, RefreshCw, Store, Truck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Componentes Refactorizados
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import OrderCard from '../components/orders/OrderCard';
import OrdersFilterBar from '../components/orders/OrdersFilterBar';
import OrderModal from '../components/orders/OrderModal';
import OrderDetailModal from '../components/orders/OrderDetailModal';

// Hooks
import { useOrders } from '../hooks/useOrders';

function OrdersManagerPage() {
    const { 
        orders, loading, searchTerm, setSearchTerm, 
        filterStatus, setFilterStatus, refreshOrders, handleCancel 
    } = useOrders();

    const [viewMode, setViewMode] = useState('grid');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleOpenDetail = (id) => {
        setSelectedOrderId(id);
        setIsDetailModalOpen(true);
    };

    // --- CONFIGURACIÓN DE COLUMNAS PARA DYNAMICTABLE ---
    const columns = useMemo(() => [
        {
            header: "Folio",
            render: (row) => <span className="font-black text-gray-900 tracking-tighter">#{row.orderNumber}</span>
        },
        {
            header: "Origen",
            render: (row) => (
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${
                    row.source === 'Web' || row.source === 2 ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                }`}>
                    {row.source === 2 ? 'Web' : 'Local'}
                </span>
            )
        },
        {
            header: "Cliente",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-xs">{row.contactName || row.clientName || 'Cliente General'}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{row.contactPhone || row.clientPhone || 'Sin Teléfono'}</span>
                </div>
            )
        },
        {
            header: "Total",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono font-black text-gray-900">${row.total?.toFixed(2)}</span>
                </div>
            )
        },
        {
            header: "Estado",
            render: (row) => (
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    row.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 
                    row.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (row) => (
                <button 
                    onClick={() => handleOpenDetail(row.id)}
                    className="text-[10px] font-black text-pink-500 hover:text-pink-600 uppercase tracking-widest bg-pink-50 px-4 py-2 rounded-xl transition-all"
                >
                    Ver Detalles
                </button>
            )
        }
    ], []);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
            <Toaster position="top-right" />
            
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
                {/* HEADER CON BOTONES DESCRIPTIVOS */}
                <PageHeader title="Gestión de Pedidos">
                    <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
                        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm mr-2">
                            <button 
                                onClick={() => window.open('/store', '_blank')}
                                className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <Store size={16} /> <span>e-ALBA</span>
                            </button>
                            <div className="w-px h-4 bg-gray-100 self-center mx-1" />
                            <button 
                                onClick={() => window.open('/track', '_blank')}
                                className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <Truck size={16} /> <span>Seguimiento de Pedidos</span>
                            </button>
                        </div>

                        <button onClick={refreshOrders} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-pink-500 shadow-sm transition-all active:scale-95">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        
                        <button 
                            onClick={() => setIsCreateModalOpen(true)} 
                            className="flex items-center gap-3 bg-pink-500 text-white px-8 py-4 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all active:scale-95"
                        >
                            <Plus size={18} strokeWidth={3} /> Nuevo Pedido
                        </button>
                    </div>
                </PageHeader>

                {/* FILTROS CON CORRECCIÓN DE RECORTE */}
                <OrdersFilterBar 
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                    viewMode={viewMode} setViewMode={setViewMode}
                />

                {/* CONTENIDO DINÁMICO (GRID O TABLA) */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-[2.5rem]" />)}
                            </motion.div>
                        ) : orders.length > 0 ? (
                            viewMode === 'grid' ? (
                                <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {orders.map(order => (
                                        <OrderCard key={order.id} order={order} onOpenDetail={handleOpenDetail} onCancel={handleCancel} onRefresh={refreshOrders} />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div key="table" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                                    <DynamicTable columns={columns} data={orders} loading={false} selectable={false} />
                                </motion.div>
                            )
                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
                                <ShoppingBag size={80} className="mx-auto mb-4 text-gray-100" />
                                <p className="text-gray-300 font-black uppercase tracking-[0.4em]">Sin resultados encontrados</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* MODALES */}
                <OrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={refreshOrders} />
                <OrderDetailModal isOpen={isDetailModalOpen} orderId={selectedOrderId} onClose={() => { setIsDetailModalOpen(false); setSelectedOrderId(null); }} />
            </div>
        </div>
    );
}

export default OrdersManagerPage;