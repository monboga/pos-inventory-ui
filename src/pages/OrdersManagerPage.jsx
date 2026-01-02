import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag, RefreshCw, Store, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Componentes
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import OrderCard from '../components/orders/OrderCard';
import OrdersFilterBar from '../components/orders/OrdersFilterBar';
import OrderModal from '../components/orders/OrderModal';
import OrderDetailModal from '../components/orders/OrderDetailModal';

// Hooks
import { useOrders } from '../hooks/useOrders';

// Animaciones de entrada (opcional, para consistencia)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function OrdersManagerPage() {
    const { 
        orders, 
        loading, 
        searchTerm, setSearchTerm, 
        filterStatus, setFilterStatus, 
        refreshOrders, 
        createOrder,
        handleCancel,
        advanceStatus, 
        pagination 
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
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${row.source === 'Web' || row.source === 2 ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
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
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${row.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
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
        // 1. WRAPPER PRINCIPAL: Full Width + Fondo Gris + Fuente Global
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            <Toaster position="top-right" />

            {/* 2. HEADER FULL WIDTH (Fuera del padding del contenido) */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestión de Pedidos">
                    {/* Botones del Header (Sin cambios en su lógica interna) */}
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
                                <Truck size={16} /> <span>Seguimiento</span>
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
            </div>

            {/* 3. CONTENIDO PRINCIPAL (Con Padding y Max-Width) */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* FILTROS */}
                <OrdersFilterBar
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                    viewMode={viewMode} setViewMode={setViewMode}
                />

                {/* GRID / TABLA */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />)}
                            </motion.div>
                        ) : orders.length > 0 ? (
                            viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {orders.map(order => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onOpenDetail={handleOpenDetail}
                                            onConfirm={() => advanceStatus(order.id, 1)}
                                            onCancel={handleCancel}
                                            onRefresh={refreshOrders}
                                            onAdvanceStatus={advanceStatus}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <DynamicTable
                                        columns={columns}
                                        data={orders}
                                        onRowClick={(row) => handleOpenDetail(row.id)}
                                    />
                                </motion.div>
                            )
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                                <ShoppingBag size={64} className="mx-auto mb-4 text-gray-200" />
                                <p className="text-gray-400 font-bold text-lg uppercase tracking-widest">No se encontraron pedidos</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* PAGINACIÓN */}
                {(pagination.totalRecords > 0 || pagination.page > 1) && (
                    <div className="flex justify-center items-center gap-4 pb-8">
                        <button
                            onClick={() => pagination.setPage(p => Math.max(1, p - 1))}
                            disabled={!pagination.hasPrev || loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-300 hover:text-pink-600 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>

                        <span className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 border border-gray-100">
                            Página <span className="text-gray-900 text-sm">{pagination.page}</span> de {pagination.totalPages}
                        </span>

                        <button
                            onClick={() => pagination.setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={!pagination.hasMore || loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-300 hover:text-pink-600 transition-all shadow-sm"
                        >
                            Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </motion.div>

            {/* MODALES */}
            <OrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={refreshOrders} />
            <OrderDetailModal isOpen={isDetailModalOpen} orderId={selectedOrderId} onClose={() => { setIsDetailModalOpen(false); setSelectedOrderId(null); }} />
        </div>
    );
}

export default OrdersManagerPage;