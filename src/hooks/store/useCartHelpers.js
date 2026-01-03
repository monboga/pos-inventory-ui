import { useMemo } from 'react';
import { getItemFinancials } from '../../utils/financials';
import { getNormalizedImageUrl } from '../../utils/imageUtils';

export const useCartHelpers = (cart) => {
    
    // 1. Helper de Imágenes (Centralizado)
    const getProductImageUrl = (product) => {
        return getNormalizedImageUrl(product.image || product.Image);
    };

    // 2. Cálculo de Totales para UI
    const totals = useMemo(() => {
        return cart.reduce((acc, item) => {
            const fin = getItemFinancials(item);
            acc.subtotal += fin.lineTotal;
            acc.count += item.quantity;
            return acc;
        }, { subtotal: 0, count: 0 });
    }, [cart]);

    return { getProductImageUrl, totals };
};