import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';
import { ORDER_STATUS } from '../constants/orderStatus';
import {useAuth} from '../context/AuthContext';


export const useOrders = (initialStatus = 'Pending') => {
    // Estado de Datos
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    // Estado de Paginación y Filtros
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(initialStatus);

    const pageSize = 10; 

    // CARGA DE DATOS (Core)
    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Enviamos status, page y searchTerm al backend
            const data = await orderService.getAll(page, pageSize, searchTerm, filterStatus);
            
            // Mapeo defensivo (Soporta si el backend devuelve array directo o objeto paginado)
            const items = data.items || data || [];
            
            setOrders(items);
            setTotalPages(data.totalPages || 1);
            setTotalRecords(data.totalCount || items.length);

        } catch (error) {
            console.error("Error cargando pedidos:", error);
            toast.error("Error al sincronizar pedidos");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filterStatus]); // <--- CRITICO: Dependencias para que se actualice al cambiar página

    // Efecto de Carga Inicial y Cambios
    useEffect(() => { 
        loadOrders(); 
    }, [loadOrders]);

    // Resetear a página 1 si cambian los filtros (Search o Status)
    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterStatus]);

    // Acciones de Negocio
    const createOrder = async (orderData) => {
        try {
            await orderService.create(orderData);
            toast.success("Pedido creado");
            loadOrders();
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const handleCancel = async (id) => {
        try {
            await orderService.cancel(id);
            toast.success("Pedido anulado");
            loadOrders();
        } catch (error) { toast.error("Error al anular"); }
    };

    const advanceStatus = async (order, currentStatusId) => {
        try {
            if (currentStatusId === 1) { 
                // Pending -> Confirmed
                
                // Lógica Dinámica:
                // Si el backend nos dice que es "A Domicilio" o "Delivery", mandamos 2.
                // Si no, asumimos que es 1 (Pickup/Local).
                // Ajusta la condición 'string' según cómo lo devuelva tu VM exacto ("A Domicilio" o "Delivery")
                const isDelivery = order.orderType === 'A Domicilio' || order.isDelivery === true;
                const typeIdToSend = isDelivery ? 2 : 1;

                // Enviamos el payload correcto
                await orderService.confirmOrder(order.id, { 
                    orderTypeId: typeIdToSend 
                }); 
            }
            else if (currentStatusId === 2) { 
                // Confirmed -> Next step depends on order type
                if (order.orderTypeId === 1) {
                    const payload = {
                        orderId: order.id,
                        userId: user.id,
                        documentTypeId: 1
                    };
                    await orderService.processToSale(payload);
                    toast.success("Pedido procesado a venta");
                } else {
                    await orderService.markAsIncoming(order.id);
                    toast.success("Pedido enviado a repartidor");
                }
            }
            else if (currentStatusId === ORDER_STATUS.INCOMING) { 
                // Incoming -> Completed
                const payload = {
                    orderId: order.id,
                    userId: user.id,
                    documentTypeId: 1
                };
                await orderService.processToSale(payload);
                toast.success("Entrega finalizada y venta generada");
            }
            
            toast.success("Estatus actualizado");
            loadOrders();
        } catch (error) {
            console.error(error);
            toast.error("No se pudo avanzar el estado");
        }
    };

    return {
        orders,
        loading,
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        refreshOrders: loadOrders,
        createOrder,
        handleCancel,
        advanceStatus,
        pagination: {
            page,
            setPage,
            totalPages,
            totalRecords,
            hasMore: page < totalPages,
            hasPrev: page > 1
        }
    };
};