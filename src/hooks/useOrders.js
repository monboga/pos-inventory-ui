import { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export const useOrders = (initialStatus = 'Pending') => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(initialStatus);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getAll();
            setOrders(data);
        } catch (error) {
            toast.error("Error al cargar pedidos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const name = (order.contactName || order.clientName || "").toLowerCase();
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || 
                                 order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, filterStatus]);

    const handleCancel = async (id) => {
        try {
            await orderService.cancel(id);
            toast.success("Pedido anulado");
            loadOrders();
        } catch (error) { toast.error("Error al anular"); }
    };

    return {
        orders: filteredOrders,
        loading,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        refreshOrders: loadOrders,
        handleCancel
    };
};