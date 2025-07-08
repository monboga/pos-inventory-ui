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
    // Estado para los productos en el carrito. Ahora almacenará objetos con cantidad.
    const [cart, setCart] = useState([]);

    // --- INICIO DE LA NUEVA LÓGICA DEL CARRITO ---

    // Función para manejar la adición de un producto al carrito.
    const handleAddToCart = (productToAdd) => {
        // Se busca si el producto ya existe en el carrito.
        const existingProduct = cart.find(item => item.id === productToAdd.id);

        // Si el producto ya existe...
        if (existingProduct) {
            // ...se actualiza el carrito incrementando la cantidad de ese producto.
            setCart(cart.map(item =>
                item.id === productToAdd.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            // Si el producto es nuevo, se añade al carrito con una cantidad inicial de 1.
            setCart([...cart, { ...productToAdd, quantity: 1 }]);
        }
    };

    // Función para actualizar la cantidad de un producto en el carrito.
    const handleUpdateQuantity = (productId, amount) => {
        setCart(cart.map(item => {
            // Se busca el producto por su ID.
            if (item.id === productId) {
                // Se calcula la nueva cantidad.
                const newQuantity = item.quantity + amount;
                // Se retorna el item con la nueva cantidad, asegurando que no sea menor a 1.
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            // Se retorna el item sin cambios si no es el que se busca.
            return item;
        }));
    };

    // Función para eliminar un producto del carrito.
    const handleRemoveFromCart = (productId) => {
        // Se filtra el arreglo del carrito para excluir el producto con el ID proporcionado.
        setCart(cart.filter(item => item.id !== productId));
    };

    // --- FIN DE LA NUEVA LÓGICA DEL CARRITO ---

    // Se utiliza useEffect para filtrar los productos cuando cambia la categoría activa.
    useEffect(() => {
        if (activeCategory === 'Todos') {
            setProducts(initialProducts);
        } else {
            const filtered = initialProducts.filter(p => p.category === activeCategory);
            setProducts(filtered);
        }
    }, [activeCategory]);

    // Retorna la estructura JSX de la página.
    return (
        // Se utiliza CSS Grid para un control de columnas más robusto.
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Columna principal para la selección de productos. */}
            <div className="lg:col-span-2 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>

                {/* Filtros de categoría. */}
                <div className="flex space-x-4 my-6 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeCategory === category ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-50'}`}>
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

            {/* Columna derecha para el resumen del pedido. */}
            {/* Se pasan las nuevas funciones como props a OrderSummary. */}
            <div className="lg:col-span-1 p-8 border-l border-pink-100 bg-white">
                <OrderSummary
                    cartItems={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveFromCart}
                />
            </div>
        </div>
    );
}

// Se exporta el componente.
export default PointOfSalePage;