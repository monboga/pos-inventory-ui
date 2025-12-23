import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';

const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE;

export function useStoreCart() {
    // Estados principales
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    // --- NUEVO: Estado para el modal de éxito ---
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null); // Guardamos la data para mostrarla en el recibo

    const [contact, setContact] = useState({ name: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Lógica Financiera ---
    const getItemFinancials = (item) => {
        const price = Number(item.price || item.Price || 0);
        const qty = Number(item.quantity || 0);
        const discountObj = item.discount || item.Discount;
        const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
        const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);

        const isDiscountActive = discountPct > 0 && qty >= minQty;
        const isBulkType = minQty > 1;

        const finalUnitPrice = isDiscountActive ? price * (1 - discountPct / 100) : price;

        return {
            unitPrice: finalUnitPrice,
            lineTotal: finalUnitPrice * qty,
            savings: (price - finalUnitPrice) * qty,
            isDiscountActive,
            isBulkType,
            discountPct,
            originalTotal: price * qty
        };
    };

    // Totales
    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.total += fin.lineTotal;
            acc.savings += fin.savings;
            return acc;
        }, { total: 0, savings: 0 });
    }, [cart]);

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    // --- Acciones ---
    const addToCart = (product) => { /* ... (Igual que antes) ... */
        const id = product.id || product.Id;
        const stock = Number(product.stock ?? product.Stock ?? 0);
        setCart(prev => {
            const exist = prev.find(i => i.id === id);
            const currentQty = exist ? exist.quantity : 0;
            if (currentQty >= stock) { toast.error("Stock máximo alcanzado"); return prev; }
            return exist ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...product, id, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => { /* ... (Igual que antes) ... */
        setCart(prev => prev.map(item => {
            if (item.id !== id) return item;
            const newQty = item.quantity + delta;
            const stock = Number(item.stock ?? item.Stock ?? 0);
            if (newQty > stock) return item;
            if (newQty < 1) return item;
            return { ...item, quantity: newQty };
        }));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const generateWhatsAppLink = () => {
        if (!BUSINESS_PHONE) return null;

        const itemsList = cart.map(item => {
            const fin = getItemFinancials(item);
            const itemName = item.description || item.name;
            let itemLine = `- *${item.quantity}x ${itemName}*`;

            if (fin.isDiscountActive) {
                itemLine += `\n   ➤ $${fin.lineTotal.toFixed(2)}`;
                itemLine += fin.isBulkType ? ` _(Mayoreo -${fin.discountPct}%)_` : ` _(Oferta -${fin.discountPct}%)_`;
                itemLine += ` ~[Antes: $${fin.originalTotal.toFixed(2)}]~`;
            } else {
                itemLine += `\n   ➤ $${fin.lineTotal.toFixed(2)}`;
            }
            return itemLine;
        }).join('\n\n');

        const header = `Hola 👋 ALBA, soy *${contact.name}*`;
        const body = `Realicé mi pedido a través de la web con los siguientes productos:`;
        const footer = `--------------------------------\n*TOTAL A PAGAR: $${orderSummary.total.toFixed(2)}*\n--------------------------------\n📱 Teléfono de contacto: ${contact.phone}`;
        const fullMessage = `${header}\n${body}\n\n${itemsList}\n\n${footer}`;

        // FIX: Usamos api.whatsapp.com y encodeURIComponent manual o URLSearchParams
        const params = new URLSearchParams();
        params.append('text', fullMessage);

        // Usamos la URL que solicitaste
        return `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&${params.toString()}`;
    };

    // ... (imports previos se mantienen igual)

    // --- Manejador de Confirmación ACTUALIZADO ---
    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Preparar Payload (Esto sigue igual)
            const payload = {
                source: 2, 
                contactName: contact.name,
                contactPhone: contact.phone,
                items: cart.map(item => {
                    const fin = getItemFinancials(item);
                    return { 
                        productId: item.id, 
                        quantity: item.quantity, 
                        unitPrice: fin.unitPrice
                    };
                }),
                total: orderSummary.total
            };

            // 2. Enviar a BD (POST)
            const createResponse = await orderService.create(payload);
            
            // Obtenemos el ID generado. 
            // Nota: Verifica si tu API devuelve el ID directo o un objeto { id: ... }
            const generatedId = createResponse?.id || createResponse?.Id || createResponse; 

            if (!generatedId) {
                throw new Error("No se recibió un ID de orden válido.");
            }

           const officialOrderData = await orderService.getById(generatedId);

            // 4. MAPEO INTELIGENTE (Merge: API + Local Context)
            const mappedOrderData = {
                id: officialOrderData.id,
                orderNumber: officialOrderData.orderNumber || "PENDIENTE",
                customerName: officialOrderData.customerName,
                total: officialOrderData.total,
                
                items: (officialOrderData.items || []).map(apiItem => {
                    // A. Buscar el ítem original en el carrito para recuperar metadatos (Tipo de descuento)
                    const localItem = cart.find(c => c.id === apiItem.productId) || {};
                    
                    // B. Calcular datos financieros oficiales
                    // Asumimos que apiItem.unitPrice es el Precio Original (según tus imágenes)
                    const quantity = apiItem.quantity;
                    const originalTotal = apiItem.unitPrice * quantity;
                    const discountVal = apiItem.discountTotal || 0;
                    const finalLineTotal = apiItem.total || (originalTotal - discountVal);

                    // C. Determinar Porcentaje y Tipo Visual
                    // Si la API trae descuento, calculamos el % real
                    const discountPct = originalTotal > 0 
                        ? Math.round((discountVal / originalTotal) * 100) 
                        : 0;

                    // Recuperamos la lógica de "Tipo" del carrito local
                    const discountObj = localItem.discount || localItem.Discount || {};
                    const minQty = Number(discountObj.minQuantity || localItem.minQuantity || 1);
                    const isBulkType = minQty > 1; // True = Mayoreo, False = Oferta Directa

                    return {
                        name: apiItem.productName,
                        quantity: quantity,
                        unitPrice: apiItem.unitPrice, // Precio lista
                        lineTotal: finalLineTotal,    // Lo que realmente pagó
                        discount: discountVal,        // Dinero ahorrado
                        discountPercentage: discountPct,
                        // Banderas para la UI
                        hasDiscount: discountVal > 0, // Solo mostramos si hay ahorro real en dinero
                        isBulkType: isBulkType        // Para pintar Azul (Mayoreo) o Rosa (Oferta)
                    };
                })
            };

            setLastOrder(mappedOrderData);

            // 5. Abrir WhatsApp (Con datos locales para rapidez o podrías usar los oficiales)
            const waLink = generateWhatsAppLink();
            if (waLink) {
                setTimeout(() => window.open(waLink, '_blank'), 500);
            }

            // 6. ÉXITO: Limpiar y Abrir Modal
            // Si algo falló antes de llegar aquí (en el GET), el catch lo atrapa y NO abre el modal
            setIsCheckoutModalOpen(false);
            setCart([]); 
            setContact({ name: '', phone: '' });
            setIsSuccessModalOpen(true); 

        } catch (error) {
            console.error("Error en el flujo de pedido:", error);
            // Si falla la creación O el fetch del detalle, mostramos error y NO abrimos el modal
            toast.error("Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler para resetear todo desde el botón "Nuevo Pedido"
    const startNewOrder = () => {
        setIsSuccessModalOpen(false);
        setLastOrder(null);
    };

    return {
        cart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        // Nuevos returns
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        lastOrder,
        startNewOrder,

        contact,
        setContact,
        isSubmitting,
        orderSummary,
        addToCart,
        updateQuantity,
        removeFromCart,
        handleConfirmOrder
    };
}