// src/hooks/common/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/productService';
import { getNormalizedImageUrl } from '../../utils/imageUtils'; // Tu utility estrella
import toast from 'react-hot-toast';

export const useProducts = (autoLoad = true) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productService.getAll();
            
            // NORMALIZACIÓN CENTRALIZADA
            // Aquí aplicamos todas las reglas de negocio para "limpiar" el producto
            const cleanProducts = data.map(p => ({
                ...p, // Conservamos todo
                id: p.id || p.Id,
                description: p.description || p.Description,
                price: Number(p.price || p.Price || 0),
                stock: p.stock ?? p.Stock ?? 0,
                // Aquí aplicamos el fix de la imagen UNA SOLA VEZ
                image: getNormalizedImageUrl(p.image || p.Image),
                // Normalizamos categorías a string para filtros fáciles
                categoryId: String(p.categoryId || p.CategoryId),
                barcode: p.barcode || p.Barcode || "",
                isActive: p.isActive ?? p.IsActive ?? true
            }));

            setProducts(cleanProducts);
            setError(null);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message || "Error al cargar productos");
            toast.error("Error de conexión con productos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoLoad) loadProducts();
    }, [autoLoad, loadProducts]);

    return { 
        products, 
        loading, 
        error, 
        refreshProducts: loadProducts 
    };
};