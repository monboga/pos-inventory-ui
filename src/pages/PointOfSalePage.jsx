import React, { useState, useEffect } from 'react';
import { Search, Loader, Filter, X, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Componentes UI
import ProductCard from '../components/pos/ProductCard';
import OrderSummary from '../components/pos/OrderSummary';
import PosClientSelector from '../components/pos/PosClientSelector';
import CategoryFilterModal from '../components/pos/CategoryFilterModal';
import SaleSuccessModal from '../components/sales/SaleSuccessModal';
import ProductSearchModal from '../components/pos/ProductSearchModal';

// Hooks & Utils
import { usePosData } from '../hooks/pos/usePosData';
import { usePosCart } from '../hooks/pos/usePosCart';
import { usePosTransaction } from '../hooks/pos/usePosTransaction';
import { useToastLimit } from '../hooks/useToastLimit';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateUtils';

const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
};
const gridItemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9 }
};

function PointOfSalePage() {
    const { user } = useAuth();
    useToastLimit(1);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const {
        allProducts,
        displayedProducts, categories, clients, loading, refreshData,
        activeCategory, setActiveCategory, searchTerm, setSearchTerm
    } = usePosData();

    const { cart, cartTotals, addToCart, updateQuantity, removeFromCart } = usePosCart();
    const { selectedClientId, clientInfo, handleClientChange, processSale, isProcessing, successData, closeSuccessModal, printTicket } = usePosTransaction(cart, () => { }, clients, user, refreshData);


    const clientOptions = clients.map(c => ({ id: c.id, name: c.fullName, rfc: c.rfc }));

    const todayFormatted = formatDateTime(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const todayString = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault(); // Prevenir marcador del navegador
                setIsSearchModalOpen(true);
            }
            // Opcional: Cerrar con Escape (aunque el Modal ya suele manejarlo o tener botón X)
            if (e.key === 'Escape') {
                setIsSearchModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    if (loading) return <div className="flex h-screen items-center justify-center bg-[#F9FAFB] text-pink-500 font-montserrat"><Loader className="animate-spin" size={40} /></div>;

    return (
        <div className="flex h-screen w-full bg-[#F9FAFB] font-montserrat overflow-hidden">
            <Toaster position="top-center" reverseOrder={false} />

            {/* --- COLUMNA IZQUIERDA (Productos) --- */}
            {/* 'relative' es clave aquí para que el Modal absoluto se posicione respecto a esta columna */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">

                {/* 1. HEADER (Con tu Fix: bg-white + mb espaciado visual) */}
                <div className="bg-white px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 z-30">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Punto de Venta</h1>
                        <p className="text-xs font-medium text-gray-400 capitalize mt-1">{todayString}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="group flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-white border border-gray-200 hover:border-pink-300 rounded-2xl text-gray-500 hover:text-pink-600 transition-all shadow-sm w-full md:w-64 cursor-text"
                        >
                            <Search size={18} />
                            <span className="text-sm font-medium flex-1 text-left">Buscar...</span>

                            {/* Hint de Teclado Visual */}
                            <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                <span className="flex items-center gap-2 text-[10px]">
                                    Ctrl + B
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => setIsCategoryModalOpen(!isCategoryModalOpen)} // Toggle
                            className={`p-3 rounded-2xl border transition-all shadow-sm flex-shrink-0 ${activeCategory !== 'Todos' || isCategoryModalOpen ? 'bg-pink-500 text-white border-pink-500' : 'bg-white border-gray-200 text-gray-500 hover:border-pink-200 hover:text-pink-500'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* 2. ÁREA DE GRID (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 custom-scrollbar relative">

                    <ProductSearchModal
                        isOpen={isSearchModalOpen}
                        onClose={() => setIsSearchModalOpen(false)}
                        products={allProducts || []} // Pasamos la lista completa
                        onAddToCart={addToCart}
                    />

                    {/* --- MODAL DE CATEGORÍAS (Inyectado aquí para el backdrop local) --- */}
                    <CategoryFilterModal
                        isOpen={isCategoryModalOpen}
                        onClose={() => setIsCategoryModalOpen(false)}
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                    />

                    {/* Tag Filtro Activo */}
                    {activeCategory !== 'Todos' && (
                        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-pink-100 rounded-2xl text-xs font-bold text-pink-600 shadow-sm">
                            <Layers size={14} />
                            <span>{categories.find(c => String(c.id || c.Id) === activeCategory)?.description || activeCategory}</span>
                            <button onClick={() => setActiveCategory('Todos')} className="ml-2 hover:bg-pink-50 rounded-full p-1"><X size={12} /></button>
                        </div>
                    )}

                    {/* Grid */}
                    <AnimatePresence mode='wait'>
                        {displayedProducts.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-4"><Search size={48} className="opacity-20" /></div>
                                <p className="font-medium">No se encontraron insumos.</p>
                            </motion.div>
                        ) : (
                            <motion.div key={activeCategory + searchTerm} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" variants={gridContainerVariants} initial="hidden" animate="visible" exit="exit">
                                {displayedProducts.map(product => {
                                    const itemInCart = cart.find(c => c.id === product.id);
                                    return (
                                        <motion.div key={product.id} variants={gridItemVariants} layout>
                                            <ProductCard product={product} currentQty={itemInCart ? itemInCart.quantity : 0} onAddToCart={addToCart} />
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- COLUMNA DERECHA (Sidebar) --- */}
            <div className="w-96 bg-white border-l border-gray-100 h-full flex flex-col shadow-2xl z-40 relative">
                <div className="p-5 border-b border-gray-50 bg-white z-20">
                    <PosClientSelector clients={clientOptions} selectedClientId={selectedClientId} onSelectClient={handleClientChange} />
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <OrderSummary cartItems={cart} totals={cartTotals} onUpdateQuantity={updateQuantity} onRemoveItem={removeFromCart} onProcessSale={processSale} isProcessing={isProcessing} selectedClientId={selectedClientId} />
                </div>
            </div>

            <SaleSuccessModal isOpen={!!successData} onClose={closeSuccessModal} saleData={successData} onPrint={printTicket} />
        </div>
    );
}

export default PointOfSalePage;