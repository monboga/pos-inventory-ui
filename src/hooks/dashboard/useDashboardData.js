import { useState, useEffect } from 'react';
import { saleService } from '../../services/saleService';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { ORDER_STATUS } from '../../constants/orderStatus'; // Asegúrate de tener esto

export const useDashboardData = () => {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ 
        todaySales: 0, 
        monthSales: 0, 
        totalOrders: 0, 
        monthOrders: 0,
        ticketAverage: 0 
    });
    const [chartData, setChartData] = useState([]); 
    const [lowStockProducts, setLowStockProducts] = useState([]);
    
    // MOCK: Top productos (El backend actual no devuelve detalles en el getAll de ventas)
    // TODO: Crear endpoint /api/dashboard/top-products
    const [topProducts] = useState([
        { name: 'Adhesivos', value: 45, color: '#ec4899' }, 
        { name: 'Pestañas', value: 30, color: '#f472b6' }, 
        { name: 'Líquidos', value: 15, color: '#fbcfe8' }, 
        { name: 'Accesorios', value: 10, color: '#fce7f3' }, 
    ]);

    useEffect(() => {
        loadData();
    }, []);

    const getLocalDateStr = (utcDateString) => {
        if (!utcDateString) return '';
        const utc = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
        return new Date(utc).toLocaleDateString('es-MX'); // Devuelve string local (ej. "30/12/2025")
    };

    const loadData = async () => {
        try {
            setLoading(true);
            // 1. Obtener datos de las 3 fuentes
            const [salesData, ordersResponse, productsData] = await Promise.all([
                saleService.getAll(), // Array de Ventas (Completadas)
                orderService.getAll(1, 1000, '', 'All'), // Pedidos (Traemos un lote grande para estadística)
                productService.getAll() // Inventario
            ]);

            const ordersData = ordersResponse.items || [];

            // 2. Procesar KPIs
            processKPIs(salesData, ordersData);

            // 3. Procesar Gráficas (Ventas vs Pedidos)
            processCharts(salesData, ordersData);

            // 4. Procesar Stock
            processStock(productsData);

        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const processKPIs = (sales, orders) => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('es-MX');
        const currentMonth = now.getMonth();

        // --- VENTAS (Dinero ingresado) ---
        const todaySales = sales
            .filter(s => getLocalDateStr(s.registrationDate) === todayStr)
            .reduce((acc, curr) => acc + curr.total, 0);

        const monthSales = sales
            .filter(s => {
                // Convertimos a objeto fecha local para checar el mes
                const utc = s.registrationDate.endsWith('Z') ? s.registrationDate : `${s.registrationDate}Z`;
                return new Date(utc).getMonth() === currentMonth;
            })
            .reduce((acc, curr) => acc + curr.total, 0);

        // --- PEDIDOS (Volumen operativo) ---
        // Filtramos solo los que son relevantes (ej. Confirmados o Completados si cuentan como pedido web)
        const relevantOrders = orders.filter(o => 
            o.statusId === ORDER_STATUS.CONFIRMED || 
            o.statusId === ORDER_STATUS.INCOMING ||
            o.statusId === ORDER_STATUS.COMPLETED
        );

        const monthOrders = relevantOrders
            .filter(o => {
                const utc = o.createdAt.endsWith('Z') ? o.createdAt : `${o.createdAt}Z`;
                return new Date(utc).getMonth() === currentMonth;
            })
            .length;

        // Ticket Promedio (Del mes)
        const salesCountMonth = sales.filter(s => new Date(s.registrationDate).getMonth() === currentMonth).length;
        const ticketAvg = salesCountMonth > 0 ? monthSales / salesCountMonth : 0;

        setKpis({
            todaySales,
            monthSales,
            totalOrders: relevantOrders.length, // Histórico de pedidos útiles
            monthOrders,
            ticketAverage: ticketAvg
        });
    };

    const processCharts = (sales, orders) => {
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateLabelTarget = d.toLocaleDateString('es-MX');
            
            // Label corto (ej. "Lun 12")
            const dateLabelVisual = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });

            // Suma de Ventas del día
            const dailySalesAmount = sales
                .filter(s => getLocalDateStr(s.registrationDate) === dateLabelTarget) // Comparación Local vs Local
                .reduce((acc, curr) => acc + curr.total, 0);

            // Conteo de Pedidos del día (Solo Confirmados/En Camino para medir flujo de trabajo)
            const dailyOrdersCount = orders
                .filter(o => 
                    getLocalDateStr(o.createdAt) === dateLabelTarget && 
                    (o.statusId === ORDER_STATUS.CONFIRMED || o.statusId === ORDER_STATUS.INCOMING)
                ).length;

            last7Days.push({
                name: dateLabelVisual,
                ventas: dailySalesAmount,
                pedidos: dailyOrdersCount
            });
        }
        setChartData(last7Days);
    };

    const processStock = (products) => {
        // Filtramos productos activos con stock bajo (<= 5)
        const lowStock = products
            .filter(p => (p.isActive ?? p.IsActive) && (Number(p.stock ?? p.Stock ?? 0) <= 5))
            .sort((a, b) => Number(a.stock) - Number(b.stock));
        
        setLowStockProducts(lowStock);
    };

    return {
        loading,
        kpis,
        chartData,
        lowStockProducts,
        topProducts
    };
};