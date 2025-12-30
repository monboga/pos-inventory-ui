import { Search, Loader, FileText, Mail, User, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Componentes UI
import ProductCard from '../components/pos/ProductCard';
import OrderSummary from '../components/pos/OrderSummary';
import AnimatedSelect from '../components/common/AnimatedSelect';
import CategoryFilter from '../components/pos/CategoryFilter';
import SaleSuccessModal from '../components/sales/SaleSuccessModal';

// Hooks (Business Logic Layers)
import { usePosData } from '../hooks/pos/usePosData';
import { usePosCart } from '../hooks/pos/usePosCart';
import { usePosTransaction } from '../hooks/pos/usePosTransaction';
import { useToastLimit } from '../hooks/useToastLimit';
import { useAuth } from '../context/AuthContext';

// Animation configs (Podrían ir a un utils/animations.js después)
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

    // 1. Capa de Datos (Data Layer)
    const { 
        displayedProducts, categories, clients, loading, refreshData,
        activeCategory, setActiveCategory, searchTerm, setSearchTerm 
    } = usePosData();

    // 2. Capa de Carrito (Cart Layer)
    const { 
        cart, addToCart, updateQuantity, removeFromCart, clearCart 
    } = usePosCart();

    // 3. Capa de Transacción (Transaction Layer)
    const { 
        selectedClientId, clientInfo, handleClientChange, processSale, 
        isProcessing, successData, closeSuccessModal, printTicket 
    } = usePosTransaction(cart, clearCart, clients, user, refreshData);

    // Mapeo simple para el Select
    const clientOptions = clients.map(c => ({ id: c.id, name: c.fullName }));

    if (loading) {
        return <div className="flex h-full items-center justify-center text-pink-500"><Loader className="animate-spin" size={40} /></div>;
    }

    return (
        <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative bg-gray-50/50">
            <Toaster position="top-center" reverseOrder={false} />

            {/* --- SECCIÓN IZQUIERDA: CATÁLOGO --- */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                <div className="p-4 md:p-6 pb-2 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar producto..." 
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-sm text-gray-700" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                        <div className="bg-pink-50 p-1.5 rounded-lg text-pink-500"><Filter size={14} /></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtrar por Categoría</span>
                    </div>

                    <CategoryFilter
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 custom-scrollbar">
                    <AnimatePresence mode='wait'>
                        {displayedProducts.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-64 text-gray-400"
                            >
                                <Search size={48} className="mb-4 opacity-20" />
                                <p>No se encontraron productos.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeCategory + searchTerm}
                                className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 md:gap-6 pb-20 lg:pb-0"
                                variants={gridContainerVariants}
                                initial="hidden" animate="visible" exit="exit"
                            >
                                {displayedProducts.map(product => {
                                    // Búsqueda eficiente en carrito
                                    const itemInCart = cart.find(c => c.id === product.id);
                                    return (
                                        <motion.div key={product.id} variants={gridItemVariants} layout>
                                            <ProductCard
                                                product={product}
                                                currentQty={itemInCart ? itemInCart.quantity : 0}
                                                onAddToCart={addToCart}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- SECCIÓN DERECHA: SIDEBAR (CLIENTE + CARRITO) --- */}
            <div className="w-full lg:w-96 border-l border-gray-200 bg-white h-full flex-shrink-0 z-20 shadow-xl lg:shadow-none flex flex-col">
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex-shrink-0 z-50">
                    <div className="mb-4">
                        <AnimatedSelect
                            label="Cliente de la Venta"
                            options={clientOptions}
                            value={selectedClientId}
                            onChange={handleClientChange}
                            icon={User}
                            placeholder="Seleccionar Cliente..."
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {clientInfo && (
                            <motion.div
                                key={clientInfo.id}
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="p-4 bg-white border border-pink-100 rounded-xl shadow-sm space-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                <p className="text-sm font-bold text-gray-800">{clientInfo.fullName}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <FileText size={14} className="text-pink-400" />
                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{clientInfo.rfc || "Sin RFC"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail size={14} className="text-pink-400" />
                                    <span className="truncate">{clientInfo.email}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-hidden relative z-0">
                    <OrderSummary
                        cartItems={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromCart}
                        onProcessSale={processSale}
                        isProcessing={isProcessing}
                        selectedClientId={selectedClientId}
                    />
                </div>
            </div>

            <SaleSuccessModal
                isOpen={!!successData}
                onClose={closeSuccessModal}
                saleData={successData}
                onPrint={printTicket}
            />
        </div>
    );
}

export default PointOfSalePage;