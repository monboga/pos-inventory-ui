import React, { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductCard from '../pos/ProductCard'; // <--- REUTILIZACIÓN

const OrderProductList = ({ cart, onAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAll();
            // Filtramos solo productos activos y con stock
            setProducts(data.filter(p => (p.isActive ?? true) && (p.stock ?? 0) > 0));
        } catch (error) {
            console.error("Error cargando productos");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.barcode || '').includes(searchTerm)
    );

    return (
        <div className="flex-1 flex flex-col bg-gray-50/50 border-r border-gray-100 h-full overflow-hidden">
            {/* Header Buscador */}
            <div className="p-6 pb-4 border-b border-gray-100 bg-white">
                <h2 className="font-black text-xl text-gray-800 tracking-tight mb-4">
                    Catálogo Disponible
                </h2>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18}/>
                    <input 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-pink-200 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                        placeholder="Buscar producto..."
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Grid de Productos Reutilizables */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-60 bg-gray-100 rounded-2xl animate-pulse"/>)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                        <Package size={48} strokeWidth={1.5} />
                        <p className="text-sm font-medium">Sin resultados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="h-full">
                                {/* AQUÍ USAMOS TU COMPONENTE EXISTENTE */}
                                <ProductCard 
                                    product={product}
                                    currentQty={cart.find(c => c.id === product.id)?.quantity || 0}
                                    onAddToCart={(p) => onAddToCart(p)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderProductList;