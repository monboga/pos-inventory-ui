import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {Package } from 'lucide-react';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

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
    const cartBtnRef = useRef(null);

    const getProductImageUrl = (product) => {
        const rawImg = product.image || product.Image;
        if (!rawImg) return null;

        if (rawImg.includes("Uploads")) {
            const cleanPath = rawImg.replace(/\\/g, '/');
            const prefix = cleanPath.startsWith('/') ? '' : '/';
            return `${API_BASE_URL}${prefix}${cleanPath}`;
        }
        return rawImg;
    };

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

    const handleAddToCartWithFly = (product, e) => {
        // Ejecutar lógica de negocio original
        addToCart(product);

        // Lógica visual (Si no hay evento, por ejemplo si se llama programáticamente, no animamos)
        if (!e) return;

        // Obtener posición de origen (donde se hizo clic o la imagen del producto)
        // Intentamos buscar la imagen dentro del target, si no, usamos el botón
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();

        // Obtener posición de destino (Icono del carrito)
        const cartRect = cartBtnRef.current?.getBoundingClientRect();

        if (!cartRect) return;

        const processedImg = getProductImageUrl(product);

        const newItem = {
            id: Date.now(), // ID único para la animación
            img: processedImg, // Asumiendo que tu producto tiene propiedad de imagen
            start: {
                x: rect.left + (rect.width / 2) - 24, // Centrar relativo al clic
                y: rect.top + (rect.height / 2) - 24,
            },
            end: {
                x: cartRect.left + (cartRect.width / 2) - 12, // Ir al centro del icono carrito
                y: cartRect.top + (cartRect.height / 2) - 12,
            }
        };

        setFlyingItems(prev => [...prev, newItem]);

        // Limpieza automática después de la animación (0.8s)
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
        }, 800);
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
                ref={cartBtnRef}
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
                                    onAddToCart={(p, e) => handleAddToCartWithFly(p, e)}
                                    currentQty={cart.find(i => i.id === (product.id || product.Id))?.quantity || 0}
                                />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </main>

            {flyingItems.map(item => (
                <motion.div
                    key={item.id}
                    initial={{ 
                        opacity: 1, 
                        scale: 1, 
                        x: item.start.x, 
                        y: item.start.y,
                        rotate: 0 
                    }}
                    animate={{ 
                        opacity: 0.5, 
                        scale: 0.2, // Se hace pequeñito al entrar al carrito
                        x: item.end.x, 
                        y: item.end.y,
                        rotate: 15
                    }}
                    transition={{ 
                        duration: 0.8, 
                        ease: [0.2, 0.8, 0.2, 1] 
                    }}
                    // Añadimos borde blanco y sombra para que destaque sobre el fondo
                    className="fixed top-0 left-0 z-50 pointer-events-none shadow-2xl rounded-full overflow-hidden border-2 border-white bg-white"
                    style={{ width: '48px', height: '48px' }}
                >
                    {item.img ? (
                        <img 
                            src={item.img} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback de seguridad por si la imagen falla al cargar
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }} 
                        />
                    ) : null}
                    
                    {/* Fallback Icon (Se muestra si no hay img o si falla la carga) */}
                    <div 
                        className={`w-full h-full bg-pink-500 flex items-center justify-center text-white ${item.img ? 'hidden' : 'flex'}`}
                    >
                        <Package size={24} strokeWidth={2.5} />
                    </div>
                </motion.div>
            ))}

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