import { useState, useRef } from 'react';
import { getNormalizedImageUrl } from '../../utils/imageUtils';


export function useFlyAnimation() {
    const [flyingItems, setFlyingItems] = useState([]);
    const cartBtnRef = useRef(null);

    const triggerFly = (product, e) => {
        // Si no hay evento (ej. carga automática), no animamos
        if (!e) return;

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const cartRect = cartBtnRef.current?.getBoundingClientRect();

        if (!cartRect) return;

        const imgUrl = getNormalizedImageUrl(product.image || product.Image);

        const newItem = {
            id: Date.now(),
            img: imgUrl,
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