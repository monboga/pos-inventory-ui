import { useState, useEffect, useCallback, useMemo } from 'react';
import { businessService } from '../../services/businessService';

// Definimos la URL Base aquí o la importamos de un config global
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

export const useBusinessData = () => {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadBusiness = useCallback(async () => {
        setLoading(true);
        try {
            const data = await businessService.getBusiness();
            if (Array.isArray(data) && data.length > 0) {
                setBusiness(data[0]);
            } else {
                setBusiness(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBusiness();
    }, [loadBusiness]);

    // --- LÓGICA DE PRESENTACIÓN (Helpers encapsulados) ---

    const logoUrl = useMemo(() => {
        if (!business || !business.logo) return null;
        
        const rawImage = business.logo;
        if (!rawImage.includes('/') && rawImage.length > 100) return `data:image/png;base64,${rawImage}`;
        
        if (rawImage.includes("Uploads") || rawImage.includes("/")) {
            const cleanPath = rawImage.replace(/\\/g, '/');
            const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
            return `${API_BASE_URL}/${pathPart}`;
        }
        return rawImage;
    }, [business]);

    const fullAddress = useMemo(() => {
        if (!business) return "";
        return [business.street, business.externalNumber, business.neighborhood]
            .filter(Boolean)
            .join(', ');
    }, [business]);

    const fullLocation = useMemo(() => {
        if (!business) return "";
        return [business.city, business.state, business.postalCode ? `CP ${business.postalCode}` : null]
            .filter(Boolean)
            .join(', ');
    }, [business]);

    return { 
        business, 
        loading, 
        refreshBusiness: loadBusiness,
        // Propiedades computadas listas para usar
        logoUrl,
        fullAddress,
        fullLocation
    };
};