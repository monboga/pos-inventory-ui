/**
 * Calcula precios y descuentos de forma unificada para toda la app.
 * Basado en el payload de productos
 */
/**
 * Calcula precios y descuentos de forma unificada para toda la app.
 */
export const getItemFinancials = (item) => {
    const price = Number(item.price || item.Price || 0);
    const qty = Number(item.quantity || 0);
    
    // ... (lógica de extracción de descuento igual que antes) ...
    const discountObj = item.discount || item.Discount;
    const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
    const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);

    const isDiscountActive = discountPct > 0 && qty >= minQty;
    const isBulkType = minQty > 1;

    const unitPriceWithDiscount = isDiscountActive 
        ? price * (1 - discountPct / 100) 
        : price;

    return {
        originalPrice: price,
        unitPrice: unitPriceWithDiscount,
        
        // ALIAS DE SEGURIDAD: Agregamos esto para compatibilidad
        finalPrice: unitPriceWithDiscount, 

        lineTotal: unitPriceWithDiscount * qty,
        savings: (price - unitPriceWithDiscount) * qty,
        isDiscountActive,
        isBulkType,
        discountPct,
        minQty,
        isNearDiscount: isBulkType && !isDiscountActive && (minQty - qty <= 2)
    };
};