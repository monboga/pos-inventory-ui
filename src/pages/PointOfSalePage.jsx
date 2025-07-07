// src/pages/PointOfSalePage.jsx

// Se importan los hooks de React y los componentes necesarios.
import React, { useState, useEffect } from 'react';
import { products as initialProducts, categories } from '../data/demo-data.js';
import ProductCard from '../components/pos/ProductCard';
import OrderSummary from '../components/pos/OrderSumary.jsx';

// Se define el componente funcional de la página del Punto de Venta.
function PointOfSalePage() {
    // Estado para la lista de productos a mostrar.
    const [products, setProducts] = useState(initialProducts);
    // Estado para la categoría activa.
    const [activeCategory, setActiveCategory] = useState('Todos');
    // Estado para los productos en el carrito.
    const [cart, setCart] = useState([]);

    // Función para manejar la adición de un producto al carrito.
    const handleAddToCart = (product) => {
        // Se añade el producto a la lista existente en el estado del carrito.
        setCart(prevCart => [...prevCart, product]);
    };

    // Se utiliza useEffect para filtrar los productos cuando cambia la categoría activa.
    useEffect(() => {
        // Si la categoría es 'Todos', se muestran todos los productos.
        if (activeCategory === 'Todos') {
            setProducts(initialProducts);
        } else {
            // Si se selecciona otra categoría, se filtran los productos.
            const filtered = initialProducts.filter(p => p.category === activeCategory);
            setProducts(filtered);
        }
    }, [activeCategory]); // El efecto se ejecuta cuando 'activeCategory' cambia.

    // Retorna la estructura JSX de la página.
    return (
        // Se utiliza CSS Grid para un control de columnas más robusto.
        // En pantallas grandes (lg), se divide en 3 columnas.
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Columna principal para la selección de productos. Ocupa 2 de 3 columnas en pantallas grandes. */}
            <div className="lg:col-span-2 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>

                {/* Filtros de categoría. */}
                <div className="flex space-x-4 my-6 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors
                ${activeCategory === category ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-50'}
              `}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Cuadrícula de productos. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            </div>

            {/* --- INICIO DE LA CORRECCIÓN --- */}
            {/* Columna derecha para el resumen del pedido. Se añade 'border-pink-100'. */}
            <div className="lg:col-span-1 p-8 border-l border-pink-100 bg-white">
                <OrderSummary cartItems={cart} />
            </div>
            {/* --- FIN DE LA CORRECCIÓN --- */}
        </div>
    );
}

// Se exporta el componente.
export default PointOfSalePage;