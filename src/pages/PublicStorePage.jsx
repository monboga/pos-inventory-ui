import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Servicios
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { orderService } from '../services/orderService';

// Componentes Refactorizados
import StoreHeader from '../components/store/StoreHeader';
import StoreSearchConfig from '../components/store/StoreSearchConfig';
import StoreCheckoutModal from '../components/store/StoreCheckoutModal';
import PublicCart from '../components/orders/PublicCart';
import ProductCard from '../components/pos/ProductCard';

// Utilidades
import { getItemFinancials } from '../utils/financials';

// assets
import logoImg from '../assets/logo.png';

function PublicStorePage() {
    // estados principales
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [flyingItems, setFlyingItems] = useState([]);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [contact, setContact] = useState({ name: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, c] = await Promise.all([productService.getAll(), categoryService.getAll()]);
                // Filtrar solo productos activos y con stock
                setProducts(p.filter(item => (item.isActive ?? item.IsActive) && Number(item.stock ?? item.Stock ?? 0) > 0));
                setCategories(c);
            } finally {
                // Un pequeño delay para asegurar que el DOM esté listo antes de quitar el skeleton
                setTimeout(() => setLoading(false), 100);
            }
        };
        fetchData();
    }, []);

    // --- Lógica de Filtrado ---
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const desc = (p.description || p.Description || "").toLowerCase();
            const matchesSearch = desc.includes(searchTerm.toLowerCase());
            const matchesCat = activeCategory === "Todos" || String(p.categoryId || p.CategoryId) === activeCategory;
            return matchesSearch && matchesCat;
        });
    }, [products, searchTerm, activeCategory]);

    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.total += fin.lineTotal;
            acc.savings += fin.savings;
            return acc;
        }, { total: 0, savings: 0 });
    }, [cart]);

    const addToCart = (product) => {
        const id = product.id || product.Id;
        const currentQty = cart.find(i => i.id === id)?.quantity || 0;

        // Verificación de stock
        if (currentQty >= Number(product.stock ?? product.Stock ?? 0)) return;

        setCart(prev => {
            const exist = prev.find(i => i.id === id);
            return exist
                ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...product, id, quantity: 1 }];
        });
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                source: 2, // Web
                contactName: contact.name,
                contactPhone: contact.phone,
                items: cart.map(item => {
                    const fin = getItemFinancials(item);
                    return { productId: item.id, quantity: item.quantity, unitPrice: fin.unitPrice };
                }),
                total: orderSummary.total
            };
            await orderService.create(payload);
            toast.success("Pedido enviado con éxito");
            setCart([]);
            setIsCheckoutModalOpen(false);
            setTimeout(() => window.close(), 1000);
        } catch (error) { toast.error("Error al procesar pedido"); }
        finally { setIsSubmitting(false); }
    };

    // --- Variantes de Animación Optimizadas ---
    const gridVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04, // Más veloz para evitar freeze
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 400, // Más rígido para respuesta inmediata
                damping: 25
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans relative overflow-x-hidden">
            <Toaster position="top-right" />

            <StoreHeader
                logo={logoImg}
                cartCount={cartCount}
                onOpenCart={() => setIsCartOpen(true)}
                onReturn={() => {
                    window.close();
                    setTimeout(() => { window.location.href = '/orders'; }, 300);
                }}
            />

            <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                <StoreSearchConfig
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                {/* FIX: Se añade key dinámico para forzar la animación en cada cambio de estado */}
                <motion.div
                    key={`${activeCategory}-${searchTerm}-${loading}`}
                    variants={gridVariants}
                    initial="hidden"
                    animate={loading ? "hidden" : "visible"}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    {loading ? (
                        Array(8).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-white animate-pulse rounded-[2rem] border border-gray-50 shadow-sm" />
                        ))
                    ) : (
                        filteredProducts.map(product => (
                            <motion.div
                                key={product.id || product.Id}
                                variants={itemVariants}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="h-full"
                            >
                                <ProductCard
                                    product={product}
                                    onAddToCart={(p) => addToCart(p)}
                                    currentQty={cart.find(i => i.id === (product.id || product.Id))?.quantity || 0}
                                />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </main>

            <PublicCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onUpdateQuantity={(id, d) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))}
                onRemove={id => setCart(p => p.filter(i => i.id !== id))}
                onCheckout={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
            />

            <StoreCheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                contact={contact}
                setContact={setContact}
                onConfirm={handleConfirmOrder}
                isSubmitting={isSubmitting}
                orderSummary={orderSummary}
            />
        </div>
    );
}

export default PublicStorePage;