import { useState, useEffect } from 'react';
import { productService } from '../../services/productService'; // Ajusta la ruta a tus servicios
import { categoryService } from '../../services/categoryService';

export function useStoreData() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, c] = await Promise.all([productService.getAll(), categoryService.getAll()]);
                
                // Filtrar solo activos y con stock positivo
                const activeProducts = p.filter(item => 
                    (item.isActive ?? item.IsActive) && 
                    Number(item.stock ?? item.Stock ?? 0) > 0
                );
                
                setProducts(activeProducts);
                setCategories(c);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                // Pequeño delay artificial para suavizar la carga de esqueletos
                setTimeout(() => setLoading(false), 200);
            }
        };
        fetchData();
    }, []);

    return { products, categories, loading };
}