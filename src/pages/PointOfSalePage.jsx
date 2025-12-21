import React, { useState, useEffect } from 'react';
import { Search, Loader, FileText, Mail, User, Filter, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/pos/ProductCard';
import OrderSummary from '../components/pos/OrderSummary'; // Asegúrate que el nombre del archivo sea correcto (OrderSummary vs OrderSumary)
import AnimatedSelect from '../components/common/AnimatedSelect';
import CategoryFilter from '../components/pos/CategoryFilter';
import SaleSuccessModal from '../components/sales/SaleSuccessModal';
import cashSoundAsset from '../assets/sounds/cash_register.mp3';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { clientService } from '../services/clientService';
import { saleService } from '../services/saleService';
import { useAuth } from '../context/AuthContext';


const DOC_TYPE_TICKET = 1;
const DOC_TYPE_FACTURA = 2;

const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            when: "beforeChildren"
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.1 }
        }
    }
};

const gridItemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.1 }
    }
};

function PointOfSalePage() {
    const { user } = useAuth();

    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [clients, setClients] = useState([]);

    const [selectedClientId, setSelectedClientId] = useState("");
    const [clientInfo, setClientInfo] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isProcessingSale, setIsProcessingSale] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [successModalData, setSuccessModalData] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData, clientsData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
                clientService.getAll()
            ]);

            const activeProducts = productsData.filter(p => (p.isActive !== undefined ? p.isActive : p.IsActive) === true);
            const activeCategories = categoriesData.filter(c => (c.isActive !== undefined ? c.isActive : c.IsActive) === true);

            setAllProducts(activeProducts);
            setDisplayedProducts(activeProducts);
            setCategories(activeCategories);
            setClients(clientsData);

        } catch (error) {
            console.error("Error cargando POS:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        let filtered = allProducts;
        if (activeCategory !== 'Todos') {
            filtered = filtered.filter(p => String(p.categoryId || p.CategoryId) === String(activeCategory));
        }
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.description || p.Description || "").toLowerCase().includes(term) ||
                (p.barcode || p.Barcode || "").includes(term)
            );
        }
        setDisplayedProducts(filtered);
    }, [activeCategory, searchTerm, allProducts]);

    // --- 3. LÓGICA CARRITO ---
    const handleAddToCart = (product) => {
        const rawDiscount = product.discount || product.Discount;
        const minQuantity = rawDiscount?.minQuantity || rawDiscount?.MinQuantity || product.minQuantity || product.MinQuantity || 1;

        const discountPercentage = Number(product.discountPercentage || product.DiscountPercentage || rawDiscount?.percentage || rawDiscount?.Percentage || 0)
        const cartItem = {
            ...product,

            // Luego normalizamos las propiedades básicas para uso interno
            id: product.id || product.Id,
            name: product.description || product.Description,
            price: Number(product.price || product.Price || 0),
            image: product.image || product.Image,
            stock: product.stock ?? product.Stock ?? 0,

            discountPercentage: discountPercentage,
            minQuantity: minQuantity,
            discountId: rawDiscount?.id || rawDiscount?.Id
        };

        const existing = cart.find(item => item.id === cartItem.id);

        // Validación de Stock
        if (existing && existing.quantity >= cartItem.stock) {
            toast.error("Stock máximo alcanzado");
            return;
        }

        if (existing) {
            setCart(cart.map(item => item.id === cartItem.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...cartItem, quantity: 1 }]);
        }
    };

    const handleUpdateQuantity = (productId, amount) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + amount;
                if (amount > 0 && newQuantity > item.stock) {
                    toast.error("Stock insuficiente");
                    return item;
                }
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));

    const handleClientChange = (val) => {
        const id = Number(val);
        setSelectedClientId(id);

        if (!id) {
            setClientInfo(null);
        } else {
            setClientInfo(clients.find(c => (c.id || c.Id) === id));
        }
    };

    const clientOptions = clients.map(c => ({
        id: c.id || c.Id,
        name: c.fullName || c.FullName || `${c.firstName} ${c.lastName}`
    }));

    const handleProcessSale = async (docTypeString, totalAmount) => {
        if (!selectedClientId || selectedClientId === 0) {
            toast.error("Selecciona un Cliente para cerrar la venta.");
            return;
        }

        setIsProcessingSale(true);
        const toastId = toast.loading('Procesando venta...');

        try {
            const payload = {
                clientId: selectedClientId,
                userId: user?.id || 1,
                documentTypeId: docTypeString === 'Factura' ? DOC_TYPE_FACTURA : DOC_TYPE_TICKET,
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await saleService.create(payload);

            const saleId = (typeof response === 'object' && response !== null)
                ? (response.id || response.Id || response.saleId)
            
                : response;
            if (!saleId) throw new Error("ID de venta inválido recibido del servidor.");
            const fullSaleDetails = await saleService.getById(saleId);
            
            toast.dismiss(toastId);

            playSuccessSound();
            setSuccessModalData(fullSaleDetails);

            setCart([]);
            setSelectedClientId("");
            setClientInfo(null);
            loadData();

        } catch (error) {
            console.error("Error venta:", error);
            toast.error("Error al procesar: " + error.message);
        } finally {
            setIsProcessingSale(false);
        }
    };

    // manejo de impresion de ticket de venta
    const handlePrintTicket = async (saleId) => {
        const toastId = toast.loading("Generando ticket PDF...");
        try {
            // 1. Obtener el BLOB del backend
            const blob = await saleService.getTicketPdf(saleId);
            
            // 2. Crear una URL local para el archivo
            const url = window.URL.createObjectURL(blob);
            
            // 3. Abrir en una nueva ventana para imprimir
            // Nota: Para tickets, suele ser mejor abrir en iframe oculto o nueva ventana
            window.open(url, '_blank');
            
            toast.success("Ticket generado", { id: toastId });
        } catch (error) {
            console.error("Error impresión:", error);
            toast.error("Error al generar ticket", { id: toastId });
        }
    };

    const handleCloseSuccess = () => {
        setSuccessModalData(null);
    };

    const playSuccessSound = () => {
        try {
            const audio = new Audio(cashSoundAsset);
            audio.volume = 0.6;
            audio.play();
        } catch (error) {
            console.warn("No se pudo reproducir el sonido de caja:", error);
        }
    }

    if (loading) return <div className="flex h-full items-center justify-center text-pink-500"><Loader className="animate-spin" size={40} /></div>;

    return (
        <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative bg-gray-50/50">

            {/* IZQUIERDA: PRODUCTOS */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                <div className="p-4 md:p-6 pb-2 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Buscar producto..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-sm text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                        <div className="bg-pink-50 p-1.5 rounded-lg text-pink-500">
                            <Filter size={14} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Filtrar por Categoría
                        </span>
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-64 text-gray-400"
                            >
                                <Search size={48} className="mb-4 opacity-20" />
                                <p>No se encontraron productos.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                // KEY IMPORTANTE: Al cambiar la categoría, React desmonta y monta el Grid nuevo
                                key={activeCategory + searchTerm}
                                className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 md:gap-6 pb-20 lg:pb-0"
                                variants={gridContainerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit" // Activamos la salida
                            >
                                {displayedProducts.map(product => {
                                    const itemInCart = cart.find(c => c.id === (product.id || product.Id));
                                    return (
                                        <motion.div
                                            key={product.id || product.Id}
                                            variants={gridItemVariants}
                                            layout // Layout animation opcional, ayuda a suavizar si se reordenan
                                        >
                                            <ProductCard
                                                product={product}
                                                currentQty={itemInCart ? itemInCart.quantity : 0}
                                                onAddToCart={handleAddToCart}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* DERECHA: CLIENTE Y RESUMEN */}
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
                                key={clientInfo.id || clientInfo.Id}
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="p-4 bg-white border border-pink-100 rounded-xl shadow-sm space-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    {clientInfo.fullName || clientInfo.FullName}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <FileText size={14} className="text-pink-400" />
                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{clientInfo.rfc || clientInfo.Rfc || "Sin RFC"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail size={14} className="text-pink-400" />
                                    <span className="truncate">{clientInfo.email || clientInfo.Email}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-hidden relative z-0">
                    <OrderSummary
                        cartItems={cart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        onProcessSale={handleProcessSale}
                        isProcessing={isProcessingSale}
                        selectedClientId={selectedClientId}
                    />
                </div>
            </div>
            <SaleSuccessModal
                isOpen={!!successModalData}
                onClose={handleCloseSuccess}
                saleData={successModalData}
                onPrint={handlePrintTicket}
            />
        </div>
    );
}

export default PointOfSalePage;