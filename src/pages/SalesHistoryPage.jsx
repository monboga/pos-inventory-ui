import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import SummaryCard from '../components/common/SummaryCard';
import SaleDetailModal from '../components/sales/SaleDetailModal';
import DateRangeModal from '../components/sales/DateRangeModal';
import { saleService } from '../services/saleService';
// Importamos icono Printer o FileText
import { Search, Eye, TrendingUp, DollarSign, ShoppingBag, FileText, Loader, Calendar, Download, FileSpreadsheet, Printer } from 'lucide-react';
import toast from 'react-hot-toast'; // Usamos toast para feedback

function SalesHistoryPage() {
    // ... (Estados existentes: sales, loading, kpis, etc. se mantienen igual) ...
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    // Estado para saber qué PDF se está descargando (para mostrar spinner en el botón)
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);

    // ... (Estados de KPIs y useEffect loadSales se mantienen igual) ...
    const [kpis, setKpis] = useState({ todaySales: 0, totalTickets: 0, avgTicket: 0 });

    const loadSales = async () => {
        try {
            setLoading(true);
            const data = await saleService.getAll();
            const sortedData = data.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
            setSales(sortedData);
            calculateKPIs(sortedData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar historial");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSales(); }, []);

    const calculateKPIs = (data) => {
        // ... (Lógica KPIs igual) ...
        const now = new Date();
        const todayString = now.toLocaleDateString();
        const todayTotal = data.filter(s => new Date(s.registrationDate).toLocaleDateString() === todayString).reduce((sum, s) => sum + (s.total || 0), 0);
        const avg = data.length > 0 ? (data.reduce((sum, s) => sum + s.total, 0) / data.length) : 0;
        setKpis({ todaySales: todayTotal, totalTickets: data.length, avgTicket: avg });
    };

    // ... (handleViewDetail y handleDateFilter iguales) ...
    const handleViewDetail = async (row) => {
        try {
            setLoadingDetail(true);
            const fullDetail = await saleService.getById(row.id || row.Id);
            setSelectedSale(fullDetail);
            setIsDetailOpen(true);
        } catch (error) {
            toast.error("Error al cargar detalle");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleDateFilter = (start, end) => {
        setDateRange({ start, end });
        setCurrentPage(1);
    };

    // --- NUEVO: FUNCIÓN PARA DESCARGAR PDF ---
    const handleDownloadPdf = async (id, saleNumber) => {
        setDownloadingPdfId(id);
        const toastId = toast.loading("Generando documento...");
        
        try {
            // 1. Llamar al servicio
            const blob = await saleService.getPdf(id);
            
            // 2. Crear URL temporal
            const url = window.URL.createObjectURL(blob);
            
            // 3. Abrir en nueva pestaña
            window.open(url, '_blank');
            
            toast.success(`Documento ${saleNumber} generado`, { id: toastId });

        } catch (error) {
            console.error(error);
            toast.error("No se pudo generar el PDF", { id: toastId });
        } finally {
            setDownloadingPdfId(null);
        }
    };

    // ... (handleExport placeholder) ...
    const handleExport = (type) => {
        toast.success(`Exportando listado a ${type}... (Próximamente)`);
        setShowExportMenu(false);
    };

    // --- COLUMNAS ACTUALIZADAS ---
    const columns = useMemo(() => [
        {
            header: "Número de Venta",
            render: (row) => (
                <div className="font-mono font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md inline-block">
                    {row.saleNumber}
                </div>
            )
        },
        {
            header: "Fecha y Hora",
            render: (row) => new Date(row.registrationDate).toLocaleString('es-MX', { 
                day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute:'2-digit' 
            })
        },
        {
            header: "Cliente",
            render: (row) => <div className="font-medium text-gray-800">{row.clientName || "Público General"}</div>
        },
        {
            header: "Documento",
            className: "text-center",
            render: (row) => (
                <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${row.documentType === 'Factura' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        <FileText size={12}/> {row.documentType || "Ticket"}
                    </span>
                </div>
            )
        },
        {
            header: "Total",
            className: "text-right",
            render: (row) => <div className="font-bold text-gray-900">${Number(row.total).toFixed(2)}</div>
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    
                    {/* BOTÓN PDF */}
                    <button 
                        onClick={() => handleDownloadPdf(row.id || row.Id, row.saleNumber)} 
                        disabled={downloadingPdfId === (row.id || row.Id)}
                        className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                        title="Ver Comprobante PDF"
                    >
                        {downloadingPdfId === (row.id || row.Id) ? (
                            <Loader size={18} className="animate-spin text-pink-500" />
                        ) : (
                            <Printer size={18} />
                        )}
                    </button>

                    {/* BOTÓN DETALLES */}
                    <button 
                        onClick={() => handleViewDetail(row)} 
                        className="p-2 text-pink-500 hover:bg-pink-50 hover:text-pink-700 rounded-lg transition-colors"
                        title="Ver Detalles"
                    >
                        {loadingDetail && selectedSale?.id === (row.id || row.Id) ? <Loader size={18} className="animate-spin" /> : <Eye size={18} />}
                    </button>
                </div>
            )
        }
    ], [loadingDetail, selectedSale, downloadingPdfId]); // Agregamos downloadingPdfId a dependencias

    // ... (Filtros y return igual) ...
    const filteredData = sales.filter(s => {
        const term = searchTerm.toLowerCase();
        const saleNum = (s.saleNumber || "").toLowerCase();
        const client = (s.clientName || "").toLowerCase();
        const matchesText = saleNum.includes(term) || client.includes(term);
        let matchesDate = true;
        if (dateRange.start && dateRange.end) {
            const saleDate = new Date(s.registrationDate);
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59);
            matchesDate = saleDate >= start && saleDate <= end;
        }
        return matchesText && matchesDate;
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
            <PageHeader title="Historial de Ventas" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Ventas de Hoy" value={`$${kpis.todaySales.toFixed(2)}`} subtitle="Calculado al momento" icon={TrendingUp} colorClass="bg-pink-100 text-pink-600" />
                <SummaryCard title="Tickets Emitidos" value={kpis.totalTickets} subtitle="Histórico total" icon={ShoppingBag} colorClass="bg-blue-100 text-blue-600" />
                <SummaryCard title="Ticket Promedio" value={`$${kpis.avgTicket.toFixed(2)}`} subtitle="Promedio general" icon={DollarSign} colorClass="bg-purple-100 text-purple-600" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Buscar por # Venta o Cliente..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto relative">
                    <button onClick={() => setIsDateModalOpen(true)} className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-colors shadow-sm ${dateRange.start ? 'border-pink-500 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <Calendar size={18} /> {dateRange.start ? 'Filtro Activo' : 'Fecha'}
                    </button>

                    {/* Menú Exportar (Para listados masivos futuros) */}
                    <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <Download size={18} /> <span>Exportar</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                                <button onClick={() => handleExport('PDF')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"><FileText size={16}/> Lista PDF</button>
                                <button onClick={() => handleExport('Excel')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"><FileSpreadsheet size={16}/> Lista Excel</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full">
                <DynamicTable 
                    columns={columns} data={currentData} loading={loading} 
                    pagination={{ currentPage, totalPages }} onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage} onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                />
            </div>

            <SaleDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} sale={selectedSale} />
            <DateRangeModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onApply={handleDateFilter} />
        </div>
    );
}

export default SalesHistoryPage;