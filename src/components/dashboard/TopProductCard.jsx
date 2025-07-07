// Se importa la librería React.
import React from 'react';

// --- Componente para la Tarjeta del Producto Más Vendido ---
function TopProductCard({ productName, sales, imageUrl }) {
    // El componente retorna la estructura JSX de la tarjeta.
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            {/* Título de la tarjeta. */}
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Producto Más Vendido</h3>
            {/* Contenedor para la imagen y detalles del producto. */}
            <div className="flex items-center">
                {/* Imagen del producto con esquinas redondeadas. */}
                <img src={imageUrl} alt={productName} className="w-20 h-20 rounded-lg object-cover" />
                {/* Contenedor para el nombre del producto y el número de ventas. */}
                <div className="ml-4">
                    {/* Nombre del producto. */}
                    <p className="font-bold text-gray-800">{productName}</p>
                    {/* Número de ventas. */}
                    <p className="text-gray-500 text-sm">{sales} unidades vendidas</p>
                </div>
            </div>
        </div>
    );
}

// Se exporta el componente para su uso en otros archivos.
export default TopProductCard;