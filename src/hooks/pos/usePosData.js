import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../common/useProducts'; // <--- NUEVO IMPORT
import { categoryService } from '../../services/categoryService';
import { clientService } from '../../services/clientService';
import toast from 'react-hot-toast';

export const usePosData = () => {
    // 1. Usamos el hook compartido para productos
    const { products: allProducts, loading: loadingProducts, refreshProducts } = useProducts();
    
    const [categories, setCategories] = useState([]);
    const [clients, setClients] = useState([]);
    const [loadingExtras, setLoadingExtras] = useState(true);
    
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Cargamos SOLO lo extra (Categorías y Clientes)
    const loadExtras = async () => {
        setLoadingExtras(true);
        try {
            const [categoriesData, clientsData] = await Promise.all([
                categoryService.getAll(),
                clientService.getAll()
            ]);

            const activeCategories = categoriesData
                .filter(c => (c.isActive ?? c.IsActive) === true)
                .map(c => ({
                    id: String(c.id || c.Id),
                    description: c.description || c.Description
                }));

            const normalizedClients = clientsData.map(c => ({
                ...c,
                id: c.id || c.Id,
                fullName: c.fullName || c.FullName || `${c.firstName} ${c.lastName}`
            }));

            setCategories(activeCategories);
            setClients(normalizedClients);
        } catch (error) {
            console.error("Error POS Extras:", error);
            toast.error("Error cargando catálogos secundarios");
        } finally {
            setLoadingExtras(false);
        }
    };

    useEffect(() => { loadExtras(); }, []);

    const refreshAll = () => {
        refreshProducts();
        loadExtras();
    };

    // 2. Filtramos productos activos para el POS
    const activeProducts = useMemo(() => 
        allProducts.filter(p => p.isActive), 
    [allProducts]);

    // 3. Lógica de Filtrado Visual (Memoizada)
    const displayedProducts = useMemo(() => {
        let filtered = activeProducts;

        if (activeCategory !== 'Todos') {
            filtered = filtered.filter(p => p.categoryId === activeCategory);
        }

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.description || "").toLowerCase().includes(term) ||
                (p.barcode || "").includes(term)
            );
        }
        return filtered;
    }, [activeCategory, searchTerm, activeProducts]);

    return {
        allProducts: activeProducts,
        displayedProducts,
        categories,
        clients,
        loading: loadingProducts || loadingExtras,
        activeCategory, setActiveCategory,
        searchTerm, setSearchTerm,
        refreshData: refreshAll
    };
};