import React, { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';

// --- Logic Layer (Hooks) ---
import { useStoreData } from '../hooks/store/useStoreData';
import { useStoreCart } from '../hooks/store/useStoreCart';
import { useFlyAnimation } from '../hooks/store/useFlyAnimation';

// --- UI Layer (Components) ---
import StoreHeader from '../components/store/StoreHeader';
import StoreSearchConfig from '../components/store/StoreSearchConfig';
import StoreCheckoutModal from '../components/store/StoreCheckoutModal';
import ProductGrid from '../components/store/ProductGrid';
import FlyingOverlay from '../components/store/FlyingOverlay';
import PublicCart from '../components/store/PublicCart'; // Ya movido a components/store
import OrderSuccessModal from '../components/store/OrderSuccessModal';

// --- Assets ---
import logoImg from '../assets/logo.png';

function PublicStorePage() {
    // 1. Inicializar Hooks
    const { products, categories, loading } = useStoreData();
    const storeCart = useStoreCart(); // Maneja toda la lógica del carrito/checkout
    const { flyingItems, triggerFly, cartBtnRef } = useFlyAnimation();

    // 2. Estado local UI (Filtros)
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");

    // 3. Filtrado de datos (Memoizado para performance)
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const desc = (p.description || p.Description || "").toLowerCase();
            const matchesSearch = desc.includes(searchTerm.toLowerCase());
            const matchesCat = activeCategory === "Todos" || String(p.categoryId || p.CategoryId) === activeCategory;
            return matchesSearch && matchesCat;
        });
    }, [products, searchTerm, activeCategory]);

    // 4. Handler Intermediario (Une lógica de carrito con lógica visual)
    const handleAddToCart = (product, e) => {
        storeCart.addToCart(product); // Lógica de negocio
        triggerFly(product, e);       // Lógica visual
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans relative overflow-x-hidden">
            <Toaster position="top-right" />

            {/* Header (Ref asignada al botón del carrito para la animación) */}
            <StoreHeader
                ref={cartBtnRef}
                logo={logoImg}
                cartCount={storeCart.cartCount}
                onOpenCart={() => storeCart.setIsCartOpen(true)}
                onReturn={() => {
                    // Cierre simple de ventana (si se abrió como popup)
                    window.close();
                }}
            />

            <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                {/* Barra de Búsqueda y Categorías */}
                <StoreSearchConfig
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                {/* Grid de Productos */}
                {/* Usamos key para forzar re-render limpio al cambiar filtros si es necesario */}
                <div key={`${activeCategory}-${loading}`}>
                    <ProductGrid
                        loading={loading}
                        products={filteredProducts}
                        cart={storeCart.cart}
                        onAddToCart={handleAddToCart}
                    />
                </div>
            </main>

            {/* --- Capas Flotantes (Overlays) --- */}

            {/* Animación de vuelo */}
            <FlyingOverlay items={flyingItems} />

            {/* Drawer del Carrito */}
            <PublicCart
                isOpen={storeCart.isCartOpen}
                onClose={() => storeCart.setIsCartOpen(false)}
                cart={storeCart.cart}
                onUpdateQuantity={storeCart.updateQuantity}
                onRemove={storeCart.removeFromCart}
                contact={storeCart.contact}
                setContact={storeCart.setContact}
                onCheckout={() => {
                    storeCart.setIsCartOpen(false);
                    storeCart.setIsCheckoutModalOpen(true);
                }}
            />

            {/* Modal de Confirmación y WhatsApp */}
            <StoreCheckoutModal
                isOpen={storeCart.isCheckoutModalOpen}
                onClose={() => storeCart.setIsCheckoutModalOpen(false)}
                contact={storeCart.contact}
                setContact={storeCart.setContact}
                onConfirm={storeCart.handleConfirmOrder} // Hook maneja la API y el redirect WA
                isSubmitting={storeCart.isSubmitting}
                orderSummary={storeCart.orderSummary}
                cart={storeCart.cart}
            />
            
            {/* modal de exito de pedido */}
            <OrderSuccessModal
                isOpen={storeCart.isSuccessModalOpen}
                orderData={storeCart.lastOrder}
                onNewOrder={storeCart.startNewOrder}
                onTrackOrder={() => {
                    // Redirección al tracking
                    window.location.href = '/track';
                }}
            />
        </div>
    );
}

export default PublicStorePage;