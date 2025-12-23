import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast, {Toaster}  from 'react-hot-toast';

// Servicios
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { orderService } from '../services/orderService';

// Componentes Refactorizados
import StoreHeader from '../components/store/StoreHeader';
import StoreSearchConfig from '../components/store/StoreSearchConfig';
import StoreCheckoutModal from '../components/store/StoreCheckoutModal';
import FlyingAnimation from '../components/store/FlyingAnimation';
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

    const cartIconRef = useRef(null);
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, c] = await Promise.all([productService.getAll(), categoryService.getAll()]);
                setProducts(p.filter(item => (item.isActive ?? item.IsActive) && Number(item.stock ?? item.Stock ?? 0) > 0));
                setCategories(c);
            } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // --- FILTRADO ---
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const desc = (p.description || p.Description || "").toLowerCase();
            const matchesSearch = desc.includes(searchTerm.toLowerCase());
            const matchesCat = activeCategory === "Todos" || String(p.categoryId || p.CategoryId) === activeCategory;
            return matchesSearch && matchesCat;
        });
    }, [products, searchTerm, activeCategory]);

    // resumen para el checkout
    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.total += fin.lineTotal;
            acc.savings += fin.savings;
            return acc;
        }, { total: 0, savings: 0 });
    }, [cart]);

    // carrito y animacines
    const addToCart = (product, event) => {
        const id = product.id || product.Id;
        const currentQty = cart.find(i => i.id === id)?.quantity || 0;
        if (currentQty >= Number(product.stock ?? product.Stock ?? 0)) return;

        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            setFlyingItems(prev => [...prev, { id: Date.now(), x: rect.left, y: rect.top, img: product.image || product.Image }]);
            setTimeout(() => setFlyingItems(p => p.slice(1)), 800);
        }

        setCart(prev => {
            const exist = prev.find(i => i.id === id);
            return exist ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...product, id, quantity: 1 }];
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

    // Funciones auxiliares del carrito
    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                const stock = Number(item.stock ?? item.Stock ?? 0);
                if (newQty > stock) return item;
                return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        }));
    };

    const calculateOrderData = () => {
        return cart.map(item => {
            // Usar la misma lógica de financials del componente PublicCart
            const price = Number(item.price || item.Price || 0);
            const qty = Number(item.quantity || 0);
            const discountObj = item.discount || item.Discount;
            const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
            const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);

            const isDiscountActive = discountPct > 0 && qty >= minQty;
            const unitPrice = isDiscountActive ? price * (1 - discountPct / 100) : price;

            return {
                productId: item.id,
                quantity: qty,
                unitPrice: unitPrice, // Precio pactado con descuento
                discountPerUnit: isDiscountActive ? (price - unitPrice) : 0,
                total: unitPrice * qty
            };
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans relative overflow-x-hidden">
            <Toaster position="top-right" />

            {/* ELEMENTOS VOLADORES (Capa superior) */}
            <FlyingAnimation items={flyingItems} />

            {/* HEADER */}
            <StoreHeader
                logo={logoImg}
                cartCount={cartCount}
                onOpenCart={() => setIsCartOpen(true)}
                onReturn={() => {
                    window.close();
                    setTimeout(() => { window.location.href = '/orders'; }, 300);
                }}
            />

            <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                {/* BUSCADOR */}
                <StoreSearchConfig 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm}
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                {/* FILTROS DE CATEGORÍA (CORREGIDO: SIEMPRE VISIBLE) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array(8).fill(0).map((_, i) => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl" />)
                    ) : filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id || product.Id} 
                            product={product} 
                            onAddToCart={(p, e) => addToCart(p, e)} 
                            currentQty={cart.find(i => i.id === (product.id || product.Id))?.quantity || 0}
                        />
                    ))}
                </div>
            </main>

            <PublicCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} 
                onUpdateQuantity={(id, d) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))}
                onRemove={id => setCart(p => p.filter(i => i.id !== id))}
                onCheckout={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
            />

            <StoreCheckoutModal 
                isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)}
                contact={contact} setContact={setContact} onConfirm={handleConfirmOrder}
                isSubmitting={isSubmitting} orderSummary={orderSummary}
            />
        </div>
    );
}

export default PublicStorePage;