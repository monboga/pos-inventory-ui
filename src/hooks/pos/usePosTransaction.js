import { useState } from 'react';
import toast from 'react-hot-toast';
import { saleService } from '../../services/saleService';
import cashSoundAsset from '../../assets/sounds/cash_register.mp3';

// Constantes internas del dominio POS
const DOC_TYPE_TICKET = 1;
const DOC_TYPE_FACTURA = 2;

export const usePosTransaction = (cart, clearCart, clients, user, refreshData) => {
    const [selectedClientId, setSelectedClientId] = useState("");
    const [clientInfo, setClientInfo] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // Selección de cliente
    const handleClientChange = (val) => {
        const id = Number(val);
        setSelectedClientId(id);
        if (!id) setClientInfo(null);
        else setClientInfo(clients.find(c => c.id === id));
    };

    // Reproducción de sonido (Efecto UI)
    const playSuccessSound = () => {
        try {
            const audio = new Audio(cashSoundAsset);
            audio.volume = 0.6;
            audio.play();
        } catch (error) {
            console.warn("Audio error:", error);
        }
    };

    // Proceso Principal de Venta
    const processSale = async (docTypeString, totalAmount) => {
        if (!selectedClientId) {
            toast.error("Selecciona un Cliente para cerrar la venta.");
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading('Procesando venta...');

        try {
            const payload = {
                clientId: selectedClientId,
                userId: user?.id || 1, // Fallback safe
                documentTypeId: docTypeString === 'Factura' ? DOC_TYPE_FACTURA : DOC_TYPE_TICKET,
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await saleService.create(payload);
            
            // Normalización respuesta backend
            const saleId = (typeof response === 'object') ? (response.id || response.Id || response.saleId) : response;
            
            if (!saleId) throw new Error("Respuesta inválida del servidor.");

            // Obtener detalles completos para el ticket
            const fullSaleDetails = await saleService.getById(saleId);

            toast.dismiss(toastId);
            playSuccessSound();
            setSuccessData(fullSaleDetails);
            
            // Limpieza post-venta
            clearCart();
            setSelectedClientId("");
            setClientInfo(null);
            refreshData(); // Actualizar stocks

        } catch (error) {
            console.error("Error venta:", error);
            toast.error("Error al procesar: " + error.message, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    // Impresión
    const printTicket = async (saleId) => {
        const toastId = toast.loading("Generando ticket PDF...");
        try {
            const blob = await saleService.getTicketPdf(saleId);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success("Ticket generado", { id: toastId });
        } catch (error) {
            console.error("Error impresión:", error);
            toast.error("Error al generar ticket", { id: toastId });
        }
    };

    const closeSuccessModal = () => setSuccessData(null);

    return {
        selectedClientId,
        clientInfo,
        handleClientChange,
        processSale,
        isProcessing,
        successData,
        closeSuccessModal,
        printTicket
    };
};