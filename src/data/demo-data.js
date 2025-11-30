// src/data/demo-data.js

// ... (el arreglo 'categories' se mantiene igual)
export const categories = [
    "Todos", "Adhesivos", "Pestañas Clásicas", "Pestañas Volumen", "Pinzas", "Kits", "Limpiadores",
];

// Se añaden nuevos campos a los productos para la vista de inventario.
export const products = [
    {
        id: 1,
        name: "Adhesivo Sky Glue S+",
        category: "Adhesivos",
        price: 25.00,
        stock: 32, // Unidades en stock
        sku: "AD-SKY-S01", // Código de producto
        status: "En Stock", // Estado del inventario
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Adhesivo",
    },
    {
        id: 2,
        name: "Blister Pestañas 0.15 C",
        category: "Pestañas Clásicas",
        price: 18.50,
        stock: 50,
        sku: "PC-015-C",
        status: "En Stock",
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Pestañas",
    },
    {
        id: 3,
        name: "Pinza Curva Vetus",
        category: "Pinzas",
        price: 12.00,
        stock: 0, // Producto agotado
        sku: "PZ-VET-C01",
        status: "Agotado",
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Pinza",
    },
    {
        id: 4,
        name: "Lash Shampoo Espuma",
        category: "Limpiadores",
        price: 15.75,
        stock: 25,
        sku: "LI-SHA-E01",
        status: "En Stock",
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Shampoo",
    },
    {
        id: 5,
        name: "Blister Pestañas 5D",
        category: "Pestañas Volumen",
        price: 22.00,
        stock: 5, // Stock bajo
        sku: "PV-005-5D",
        status: "Stock Bajo",
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Volumen",
    },
    {
        id: 6,
        name: "Blister Pestañas 5D",
        category: "Pestañas Volumen",
        price: 22.00,
        stock: 5, // Stock bajo
        sku: "PV-005-5D",
        status: "Stock Bajo",
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Volumen",
    },
    {
        id: 7,
        name: "Blister Pestañas 3D",
        category: "Pestañas Volumen",
        price: 22.00,
        stock: 5, // Stock bajo
        sku: "PV-005-3D",
        status: "Stock Alto",
        imageUrl: "https://via.placeholder.com/150/FBCFE8/831843?text=Volumen",
    }
    // ... (puedes añadir el resto de los productos con los nuevos campos)
];