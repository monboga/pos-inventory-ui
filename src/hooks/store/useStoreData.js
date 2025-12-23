import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

export function useStoreData() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, c] = await Promise.all([productService.getAll(), categoryService.getAll()]);
                // Filtrar activos y con stock
                setProducts(p.filter(item => (item.isActive ?? item.IsActive) && Number(item.stock ?? item.Stock ?? 0) > 0));
                setCategories(c);
            } catch (error) {
                console.error("Error cargando datos de la tienda", error);
            } finally {
                setTimeout(() => setLoading(false), 100);
            }
        };
        fetchData();
    }, []);

    return { products, categories, loading };
}