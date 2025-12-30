import { useState, useEffect } from 'react';
import { storeService } from '../../services/storeService';

export const useStoreData = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCatalog();
    }, []);

    const loadCatalog = async () => {
        setLoading(true);
        try {
            const data = await storeService.getCatalog();
            
            // 1. Mapear Categorías (Asegurar estructura {id, description/name})
            const mappedCategories = (data.categories || []).map(cat => ({
                id: cat.id,
                description: cat.name, // Adaptador para tu UI
                isActive: true
            }));

            // 2. Mapear Productos (Adaptador API -> UI Component)
            const mappedProducts = (data.products || []).map(prod => ({
                id: prod.id,
                description: prod.name,       // UI espera 'description'
                price: prod.originalPrice,       // UI espera 'price' (usamos el final)
                finalPrice: prod.finalPrice,
                originalPrice: prod.originalPrice,
                image: prod.imageUrl,         // UI espera 'image'
                stock: prod.stock,
                categoryId: prod.categoryId,
                categoryName: prod.categoryName,
                discountPercentage: prod.discountPercentage,
                minQuantity: prod.discountMinQuantity || 1,
                isBulkDiscount: (prod.isBulkDiscount || 1) > 1,
                isActive: true
            }));

            setCategories(mappedCategories);
            setProducts(mappedProducts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { products, categories, loading, error, refresh: loadCatalog };
};