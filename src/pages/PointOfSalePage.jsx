import React, { useState, useEffect } from 'react';
import { Search, Loader, User, FileText, Mail } from 'lucide-react'; 
import ProductCard from '../components/pos/ProductCard';
import OrderSummary from '../components/pos/OrderSumary'; 
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { clientService } from '../services/clientService';
import { saleService } from '../services/saleService';
import { useAuth } from '../context/AuthContext'; 

// --- FIX: IDs Correctos según tu Base de Datos ---
const DOC_TYPE_TICKET = 1;  // Ticket
const DOC_TYPE_FACTURA = 2; // Factura

function PointOfSalePage() {
    const { user } = useAuth(); 

    // Estados Datos
    const [allProducts, setAllProducts] = useState([]); 
    const [displayedProducts, setDisplayedProducts] = useState([]); 
    const [categories, setCategories] = useState([]);
    const [clients, setClients] = useState([]); 
    
    // Estados Selección Cliente
    const [selectedClientId, setSelectedClientId] = useState(0); 
    const [clientInfo, setClientInfo] = useState(null);

    // Estados UI
    const [loading, setLoading] = useState(true);
    const [isProcessingSale, setIsProcessingSale] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);

    // 1. CARGA INICIAL
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

    // 2. Filtros
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

    // 3. Lógica Carrito
    const handleAddToCart = (product) => {
        const cartItem = {
            id: product.id || product.Id,
            name: product.description || product.Description,
            price: Number(product.price || product.Price || 0),
            image: product.image || product.Image,
            stock: product.stock ?? product.Stock ?? 0
        };
        const existing = cart.find(item => item.id === cartItem.id);
        if (existing && existing.quantity >= cartItem.stock) return; 

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
                if (amount > 0 && newQuantity > item.stock) return item;
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));

    // 4. Lógica Cliente
    const handleClientChange = (e) => {
        const id = Number(e.target.value);
        setSelectedClientId(id);
        if (id === 0) setClientInfo(null);
        else setClientInfo(clients.find(c => (c.id || c.Id) === id));
    };

    // 5. PROCESAR VENTA (FIXED)
    const handleProcessSale = async (docTypeString, totalAmount) => {
        // Validación Cliente
        if (selectedClientId === 0) {
            alert("⚠️ Por favor selecciona un Cliente para cerrar la venta.");
            return;
        }

        setIsProcessingSale(true);
        try {
            // --- FIX: Selección dinámica del ID de documento ---
            // Si el modal manda 'Factura', usamos 2. Si manda 'Ticket' (o cualquier otro), usamos 1.
            const docTypeId = docTypeString === 'Factura' ? DOC_TYPE_FACTURA : DOC_TYPE_TICKET;

            const payload = {
                clientId: selectedClientId, 
                userId: user?.id || 1, 
                documentTypeId: docTypeId, // <--- Aquí va el 1 o 2 dinámicamente
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            console.log("Enviando Payload:", payload); 

            await saleService.create(payload);
            
            alert(`✅ Venta (${docTypeString}) registrada con éxito`);
            
            setCart([]);
            setSelectedClientId(0);
            setClientInfo(null);
            loadData(); 

        } catch (error) {
            console.error("Error venta:", error);
            alert("❌ Error al procesar venta: " + error.message);
        } finally {
            setIsProcessingSale(false);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center text-pink-500"><Loader className="animate-spin" size={40}/></div>;

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
                    <div className="flex items-center space-x-3 overflow-x-auto p-2 custom-scrollbar">
                        <button onClick={() => setActiveCategory('Todos')} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === 'Todos' ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200 transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200'}`}>Todos</button>
                        {categories.map(cat => (
                            <button key={cat.id || cat.Id} onClick={() => setActiveCategory(String(cat.id || cat.Id))} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === String(cat.id || cat.Id) ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200 transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200'}`}>{cat.description || cat.Description}</button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 custom-scrollbar">
                    {displayedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Search size={48} className="mb-4 opacity-20" /><p>No se encontraron productos.</p></div>
                    ) : (
                        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 pb-20 lg:pb-0">
                            {displayedProducts.map(product => {
                                const itemInCart = cart.find(c => c.id === (product.id || product.Id));
                                return (
                                    <ProductCard 
                                        key={product.id || product.Id} 
                                        product={product} 
                                        currentQty={itemInCart ? itemInCart.quantity : 0}
                                        onAddToCart={handleAddToCart} 
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* DERECHA: CLIENTE Y RESUMEN */}
            <div className="w-full lg:w-96 border-l border-gray-200 bg-white h-full flex-shrink-0 z-20 shadow-xl lg:shadow-none flex flex-col">
                
                {/* --- SECCIÓN CLIENTE --- */}
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Cliente de la Venta</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white appearance-none font-medium text-gray-700 shadow-sm"
                            value={selectedClientId}
                            onChange={handleClientChange}
                        >
                            <option value="0">Seleccionar Cliente...</option>
                            {clients.map(c => (
                                <option key={c.id || c.Id} value={c.id || c.Id}>
                                    {c.fullName || c.FullName || `${c.firstName} ${c.lastName}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {clientInfo && (
                        <div className="mt-4 p-4 bg-white border border-pink-100 rounded-xl shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                {clientInfo.fullName || clientInfo.FullName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FileText size={14} className="text-pink-400"/> 
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{clientInfo.rfc || clientInfo.Rfc || "Sin RFC"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Mail size={14} className="text-pink-400"/> 
                                <span className="truncate">{clientInfo.email || clientInfo.Email}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden">
                    <OrderSummary
                        cartItems={cart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        onProcessSale={handleProcessSale} // Pasamos la función al hijo
                        isProcessing={isProcessingSale}
                    />
                </div>
            </div>
        </div>
    );
}

export default PointOfSalePage;