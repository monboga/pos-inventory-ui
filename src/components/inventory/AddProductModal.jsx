// src/components/inventory/AddProductModal.jsx

// Se importa la librería React.
import React from 'react';

// Se define el componente del modal.
// Acepta 'isOpen' para controlar su visibilidad y 'onClose' para cerrarlo.
function AddProductModal({ isOpen, onClose }) {
    // Si 'isOpen' es falso, el componente no renderiza nada.
    if (!isOpen) return null;

    // Retorna la estructura JSX del modal.
    return (
        // Contenedor principal del modal, con un fondo semi-transparente.
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            {/* Contenedor del contenido del modal con fondo blanco y estilos. */}
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
                {/* Encabezado del modal. */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Añadir Nuevo Producto</h2>
                    {/* Botón para cerrar el modal. */}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {/* Formulario para añadir el producto. */}
                <form className="space-y-4">
                    {/* Campo para el nombre del producto. */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    {/* Más campos se pueden añadir aquí (categoría, precio, stock, etc.). */}

                    {/* Contenedor para los botones de acción del formulario. */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600">Guardar Producto</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Se exporta el componente.
export default AddProductModal;