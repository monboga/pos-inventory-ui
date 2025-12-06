import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react'; 
import ProductCard from '../components/pos/ProductCard';
import OrderSummary from '../components/pos/OrderSumary'; 
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

function PointOfSalePage() {
    const [allProducts, setAllProducts] = useState([]); 
    const [displayedProducts, setDisplayedProducts] = useState([]); 
    const [categories, setCategories] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [cart, setCart] = useState([]);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [productsData, categoriesData] = await Promise.all([
                    productService.getAll(),
                    categoryService.getAll()
                ]);

                const activeProducts = productsData.filter(p => {
                    return (p.isActive !== undefined ? p.isActive : p.IsActive) === true;
                });
                
                setAllProducts(activeProducts);
                setDisplayedProducts(activeProducts);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error cargando POS:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- FILTRADO ---
    useEffect(() => {
        let filtered = allProducts;

        if (activeCategory !== 'Todos') {
            filtered = filtered.filter(p => {
                const pCatId = String(p.categoryId || p.CategoryId);
                return pCatId === String(activeCategory);
            });
        }

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => {
                const desc = (p.description || p.Description || "").toLowerCase();
                const code = (p.barcode || p.Barcode || "").toLowerCase();
                return desc.includes(term) || code.includes(term);
            });
        }

        setDisplayedProducts(filtered);
    }, [activeCategory, searchTerm, allProducts]);

    // --- LÓGICA CARRITO ---
    const handleAddToCart = (product) => {
        const cartItem = {
            id: product.id || product.Id,
            name: product.description || product.Description,
            price: Number(product.price || product.Price || 0),
            image: product.image || product.Image,
            stock: product.stock || product.Stock
        };

        const existing = cart.find(item => item.id === cartItem.id);
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
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    if (loading) return <div className="flex h-full items-center justify-center text-pink-500"><Loader className="animate-spin" size={40}/></div>;

    return (
        <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative bg-gray-50/50">
            
            {/* --- SECCIÓN IZQUIERDA: PRODUCTOS --- */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                
                {/* Header (Buscador y Categorías) */}
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

                    {/* Barra de Categorías */}
                    <div className="flex space-x-3 overflow-x-auto pb-4 custom-scrollbar">
                        <button 
                            onClick={() => setActiveCategory('Todos')} 
                            className={`
                                px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                                ${activeCategory === 'Todos' 
                                    ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200 transform scale-105' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200'
                                }
                            `}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id || cat.Id} 
                                onClick={() => setActiveCategory(String(cat.id || cat.Id))} 
                                className={`
                                    px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                                    ${activeCategory === String(cat.id || cat.Id) 
                                        ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200 transform scale-105' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200'
                                    }
                                `}
                            >
                                {cat.description || cat.Description}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- GRID PRODUCTOS --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 custom-scrollbar">
                    {displayedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p>No se encontraron productos.</p>
                        </div>
                    ) : (
                        // --- FIX AQUÍ ---
                        // grid-cols-2: Base (Móvil y Laptops normales con sidebar abierto)
                        // lg:grid-cols-2: Forzamos 2 columnas también en pantallas grandes si el sidebar reduce espacio
                        // xl:grid-cols-3: Solo subimos a 3 columnas en pantallas muy anchas (Desktop completo)
                        // 2xl:grid-cols-4: Pantallas gigantes
                        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 pb-20 lg:pb-0">
                            {displayedProducts.map(product => (
                                <ProductCard 
                                    key={product.id || product.Id} 
                                    product={product} 
                                    onAddToCart={handleAddToCart} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECCIÓN DERECHA: RESUMEN --- */}
            <div className="w-full lg:w-96 border-l border-gray-200 bg-white h-full flex-shrink-0 z-20 shadow-xl lg:shadow-none">
                <OrderSummary
                    cartItems={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveFromCart}
                />
            </div>
        </div>
    );
}

export default PointOfSalePage;