import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { storeService } from '../../services/storeService';

const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE;

export function useStoreCart() {
    // Estados principales
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    // --- NUEVO: Estado para el modal de éxito ---
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null); // Guardamos la data para mostrarla en el recibo

    const [contact, setContact] = useState({ 
        name: '', 
        phone: '',
        street: '',
        externalNumber: '',
        neighborhood: ''
    });
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
    const handleConfirmOrder = async () => {
        if (cart.length === 0) return;

        setIsSubmitting(true);
        try {
            // Construir Payload Inteligente
            const payload = {
                contactName: contact.name,
                contactPhone: contact.phone,
                
                // FIX: Enviamos NULL si no es delivery o si el campo está vacío
                contactStreet: contact.isDelivery && contact.street ? contact.street : null,
                contactExternalNumber: contact.isDelivery && contact.externalNumber ? contact.externalNumber : null,
                contactNeighborhood: contact.isDelivery && contact.neighborhood ? contact.neighborhood : null,
                
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            // 1. Crear Orden (POST)
            const createdId = await storeService.checkout(payload);

            // 2. Obtener Detalle Oficial (GET) - Usando el nuevo endpoint del StoreController
            // Nota: Asegúrate de agregar getOrder al storeService.js apuntando a api/store/orders/{id}
            const response = await storeService.getOrder(createdId); 
            // Si storeService.getOrder no existe aún, usa axios directo temporalmente:
            // const response = await api.get(`/api/store/orders/${createdId}`);

            const officialOrder = response.data || response;

            // 3. Setear datos para modal de éxito
            setLastOrder(officialOrder);

            // 4. Limpiar
            setCart([]);
            setContact({ name: '', phone: '', isDelivery: false, street: '', externalNumber: '', neighborhood: '' });
            setIsCheckoutModalOpen(false);
            setIsSuccessModalOpen(true);

        } catch (error) {
            console.error(error);
            toast.error("Error al procesar el pedido. Verifique los datos.");
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