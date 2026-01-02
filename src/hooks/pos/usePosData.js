import { useState, useEffect, useMemo } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { clientService } from '../../services/clientService';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

export const usePosData = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de UI para filtros
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.includes("http")) return img; // Ya es absoluta
        
        if (img.includes("Uploads")) {
            const cleanPath = img.replace(/\\/g, '/');
            const prefix = cleanPath.startsWith('/') ? '' : '/';
            return `${API_BASE_URL}${prefix}${cleanPath}`;
        }
        return img;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData, clientsData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
                clientService.getAll()
            ]);

            // 1. Normalización y Filtrado de Activos
            // Mapeamos aquí para que el resto de la app use nombres consistentes (camelCase)
            const activeProducts = productsData
                .filter(p => (p.isActive ?? p.IsActive) === true)
                .map(p => ({
                    ...p, // Mantenemos propiedades originales por seguridad
                    id: p.id || p.Id,
                    description: p.description || p.Description,
                    price: Number(p.price || p.Price || 0),
                    image: getImageUrl(p.image || p.Image),
                    stock: p.stock ?? p.Stock ?? 0,
                    categoryId: String(p.categoryId || p.CategoryId), // String para comparar fácil
                    barcode: p.barcode || p.Barcode || ""
                }));

            const activeCategories = categoriesData
                .filter(c => (c.isActive ?? c.IsActive) === true)
                .map(c => ({
                    id: String(c.id || c.Id),
                    description: c.description || c.Description
                }));

            const normalizedClients = clientsData.map(c => ({
                ...c,
                id: c.id || c.Id,
                fullName: c.fullName || c.FullName || `${c.firstName} ${c.lastName}`,
                rfc: c.rfc || c.Rfc,
                email: c.email || c.Email,
                phoneNumber: c.phoneNumber || c.PhoneNumber
            }));

            setAllProducts(activeProducts);
            setCategories(activeCategories);
            setClients(normalizedClients);

        } catch (error) {
            console.error("Error cargando POS:", error);
            toast.error("Error al cargar datos del sistema");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // 2. Lógica de Filtrado Memoizada (Eficiencia)
    // El componente ya no tiene que calcular esto en cada render
    const displayedProducts = useMemo(() => {
        let filtered = allProducts;

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
    }, [activeCategory, searchTerm, allProducts]);

    return {
        // Data
        allProducts,
        displayedProducts,
        categories,
        clients,
        loading,
        
        // Filtros
        activeCategory,
        setActiveCategory,
        searchTerm,
        setSearchTerm,
        
        // Actions
        refreshData: loadData
    };
};