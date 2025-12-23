import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';

// Obtenemos el teléfono del entorno
const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE;

export function useStoreCart() {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [contact, setContact] = useState({ name: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Lógica Financiera (Centralizada) ---
    const getItemFinancials = (item) => {
        const price = Number(item.price || item.Price || 0);
        const qty = Number(item.quantity || 0);
        const discountObj = item.discount || item.Discount;
        const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
        const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);

        const isDiscountActive = discountPct > 0 && qty >= minQty;
        const isBulkType = minQty > 1; // Para diferenciar mensaje de Mayoreo vs Oferta

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

    // Totales Globales
    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.total += fin.lineTotal;
            acc.savings += fin.savings;
            return acc;
        }, { total: 0, savings: 0 });
    }, [cart]);

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    // --- Acciones del Carrito ---
    const addToCart = (product) => {
        const id = product.id || product.Id;
        const stock = Number(product.stock ?? product.Stock ?? 0);

        setCart(prev => {
            const exist = prev.find(i => i.id === id);
            const currentQty = exist ? exist.quantity : 0;

            if (currentQty >= stock) {
                toast.error("Stock máximo alcanzado");
                return prev;
            }

            return exist
                ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...product, id, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id !== id) return item;

            const newQty = item.quantity + delta;
            const stock = Number(item.stock ?? item.Stock ?? 0);

            if (newQty > stock) return item;
            if (newQty < 1) return item;

            return { ...item, quantity: newQty };
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    // --- Generador de WhatsApp (MEJORADO) ---
    const generateWhatsAppLink = () => {
        if (!BUSINESS_PHONE) return null;

        // Construimos la lista de productos con detalle de descuentos
        const itemsList = cart.map(item => {
            const fin = getItemFinancials(item);
            const itemName = item.description || item.name;

            // Base del mensaje: Cantidad y Nombre en negritas (*)
            let itemLine = `- *${item.quantity}x ${itemName}*`;

            if (fin.isDiscountActive) {
                // Si tiene descuento, mostramos el precio final y el original tachado (simulado con texto) o explicado
                // WhatsApp no soporta tachado nativo en todos los dispositivos, usamos formato explicativo:
                itemLine += `\n   ➤ $${fin.lineTotal.toFixed(2)}`;

                if (fin.isBulkType) {
                    itemLine += ` _(Mayoreo -${fin.discountPct}%)_`;
                } else {
                    itemLine += ` _(Oferta -${fin.discountPct}%)_`;
                }
                // Agregamos el precio original como referencia
                itemLine += ` ~[Antes: $${fin.originalTotal.toFixed(2)}]~`;
            } else {
                // Precio normal
                itemLine += `\n   ➤ $${fin.lineTotal.toFixed(2)}`;
            }

            return itemLine;
        }).join('\n\n'); // Doble salto de línea para que se lea mejor

        // Mensaje Principal
        const header = `Hola 👋 ALBA, soy *${contact.name}*`;
        const body = `Realicé mi pedido a través de la web con los siguientes productos:`;

        const footer = `--------------------------------
*TOTAL A PAGAR: $${orderSummary.total.toFixed(2)}*
--------------------------------
📱 Teléfono de contacto: ${contact.phone}`;

        const fullMessage = `${header}\n${body}\n\n${itemsList}\n\n${footer}`;

        // FIX EMOJIS: Usamos URLSearchParams que maneja mejor la codificación UTF-8
        const params = new URLSearchParams();
        params.append('text', fullMessage);

        return `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&${params.toString()}`;
    };

    // --- Manejador de Confirmación ---
    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                source: 2,
                contactName: contact.name,
                contactPhone: contact.phone,
                items: cart.map(item => {
                    const fin = getItemFinancials(item);
                    return { productId: item.id, quantity: item.quantity, unitPrice: fin.unitPrice };
                }),
                total: orderSummary.total
            };

            await orderService.create(payload);
            toast.success("Pedido registrado correctamente");

            const waLink = generateWhatsAppLink();
            if (waLink) {
                setTimeout(() => {
                    window.open(waLink, '_blank');
                }, 1000);
            }

            setCart([]);
            setIsCheckoutModalOpen(false);
            setContact({ name: '', phone: '' });

        } catch (error) {
            console.error(error);
            toast.error("Error al procesar el pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        cart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
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