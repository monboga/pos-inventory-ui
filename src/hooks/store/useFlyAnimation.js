import { useState, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function useFlyAnimation() {
    const [flyingItems, setFlyingItems] = useState([]);
    const cartBtnRef = useRef(null);

    // Helper para limpiar URL de imagen
    const getProductImageUrl = (product) => {
        const rawImg = product.image || product.Image;
        if (!rawImg) return null;
        if (rawImg.includes("Uploads")) {
            const cleanPath = rawImg.replace(/\\/g, '/');
            const prefix = cleanPath.startsWith('/') ? '' : '/';
            return `${API_BASE_URL}${prefix}${cleanPath}`;
        }
        return rawImg;
    };

    const triggerFly = (product, e) => {
        // Si no hay evento (ej. carga automática), no animamos
        if (!e) return;

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const cartRect = cartBtnRef.current?.getBoundingClientRect();

        if (!cartRect) return;

        const newItem = {
            id: Date.now(),
            img: getProductImageUrl(product),
            start: {
                x: rect.left + (rect.width / 2) - 24,
                y: rect.top + (rect.height / 2) - 24,
            },
            end: {
                x: cartRect.left + (cartRect.width / 2) - 12,
                y: cartRect.top + (cartRect.height / 2) - 12,
            }
        };

        setFlyingItems(prev => [...prev, newItem]);

        // Autolimpieza
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
        }, 800);
    };

    return { flyingItems, triggerFly, cartBtnRef };
}