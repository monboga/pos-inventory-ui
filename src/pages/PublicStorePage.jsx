import React, { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';

// Hooks Personalizados (Logic)
import { useStoreData } from '../hooks/store/useStoreData';
import { useStoreCart } from '../hooks/store/useStoreCart';
import { useFlyAnimation } from '../hooks/store/useFlyAnimation';

// Componentes (UI)
import StoreHeader from '../components/store/StoreHeader';
import StoreSearchConfig from '../components/store/StoreSearchConfig';
import StoreCheckoutModal from '../components/store/StoreCheckoutModal';
import ProductGrid from '../components/store/ProductGrid';
import FlyingOverlay from '../components/store/FlyingOverlay';
import PublicCart from '../components/orders/PublicCart';

// Assets
import logoImg from '../assets/logo.png';

function PublicStorePage() {
    // 1. Hooks de Lógica
    const { products, categories, loading } = useStoreData();
    const storeCart = useStoreCart(); // Retorna todo lo relacionado al carrito
    const { flyingItems, triggerFly, cartBtnRef } = useFlyAnimation();

    // 2. Estado local para filtros (UI State)
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");

    // 3. Lógica de Filtrado (Se queda aquí porque depende de inputs UI)
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const desc = (p.description || p.Description || "").toLowerCase();
            const matchesSearch = desc.includes(searchTerm.toLowerCase());
            const matchesCat = activeCategory === "Todos" || String(p.categoryId || p.CategoryId) === activeCategory;
            return matchesSearch && matchesCat;
        });
    }, [products, searchTerm, activeCategory]);

    // 4. Handler combinado (Negocio + UI)
    const handleAddProduct = (product, e) => {
        storeCart.addToCart(product);
        triggerFly(product, e);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans relative overflow-x-hidden">
            <Toaster position="top-right" />

            {/* Header con Ref para la animación */}
            <StoreHeader
                ref={cartBtnRef}
                logo={logoImg}
                cartCount={storeCart.cartCount}
                onOpenCart={() => storeCart.setIsCartOpen(true)}
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

                {/* Key prop fuerza re-render de animación al cambiar filtros */}
                <div key={`${activeCategory}-${searchTerm}-${loading}`}>
                    <ProductGrid 
                        loading={loading}
                        products={filteredProducts}
                        cart={storeCart.cart}
                        onAddToCart={handleAddProduct}
                    />
                </div>
            </main>

            {/* Capa de Animación */}
            <FlyingOverlay items={flyingItems} />

            {/* Modales y Drawers */}
            <PublicCart
                isOpen={storeCart.isCartOpen}
                onClose={() => storeCart.setIsCartOpen(false)}
                cart={storeCart.cart}
                onUpdateQuantity={storeCart.updateQuantity}
                onRemove={storeCart.removeFromCart}
                onCheckout={() => { storeCart.setIsCartOpen(false); storeCart.setIsCheckoutModalOpen(true); }}
            />

            <StoreCheckoutModal
                isOpen={storeCart.isCheckoutModalOpen}
                onClose={() => storeCart.setIsCheckoutModalOpen(false)}
                contact={storeCart.contact}
                setContact={storeCart.setContact}
                onConfirm={storeCart.handleConfirmOrder}
                isSubmitting={storeCart.isSubmitting}
                orderSummary={storeCart.orderSummary}
            />
        </div>
    );
}

export default PublicStorePage;