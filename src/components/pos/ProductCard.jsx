// src/components/pos/ProductCard.jsx

// Se importa la librería React.
import React from 'react';

// Se define el componente para mostrar un solo producto.
// Acepta un objeto 'product' y una función 'onAddToCart' como props.
function ProductCard({ product, onAddToCart }) {
    // Retorna la estructura JSX de la tarjeta del producto.
    return (
        // Contenedor principal de la tarjeta con estilos y un efecto de hover.
        <div
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col cursor-pointer transition-transform hover:scale-105"
            onClick={() => onAddToCart(product)} // Llama a la función para añadir al carrito al hacer clic.
        >
            {/* Contenedor para la imagen del producto. */}
            <div className="bg-pink-50 rounded-lg mb-4">
                {/* Etiqueta de imagen con una relación de aspecto cuadrada. */}
                <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-lg" />
            </div>
            {/* Contenedor para el nombre y la categoría del producto. */}
            <div className="flex-grow">
                {/* Nombre del producto. */}
                <p className="font-bold text-gray-800">{product.name}</p>
                {/* Categoría del producto con un estilo distintivo. */}
                <p className="text-xs text-pink-500 font-semibold mt-1">{product.category}</p>
            </div>
            {/* Precio del producto, alineado en la parte inferior. */}
            <p className="text-lg font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>
        </div>
    );
}

// Se exporta el componente.
export default ProductCard;