/**
 * Calcula precios y descuentos de forma unificada para toda la app.
 * Basado en el payload de productos
 */
export const getItemFinancials = (item) => {
    const price = Number(item.price || item.Price || 0);
    const qty = Number(item.quantity || 0);
    
    // Extracción segura del objeto discount del payload
    const discountObj = item.discount || item.Discount;
    const discountPct = Number(discountObj?.percentage || item.discountPercentage || 0);
    const minQty = Number(discountObj?.minQuantity || item.minQuantity || 1);

    // Un descuento es activo si la cantidad en carrito iguala o supera el mínimo
    const isDiscountActive = discountPct > 0 && qty >= minQty;
    const isBulkType = minQty > 1; // True = Mayoreo (Azul), False = Oferta Directa (Rosa)

    const unitPriceWithDiscount = isDiscountActive 
        ? price * (1 - discountPct / 100) 
        : price;

    return {
        originalPrice: price,
        unitPrice: unitPriceWithDiscount,
        lineTotal: unitPriceWithDiscount * qty,
        savings: (price - unitPriceWithDiscount) * qty,
        isDiscountActive,
        isBulkType,
        discountPct,
        minQty,
        // Feedback para invitar a completar el mayoreo
        isNearDiscount: isBulkType && !isDiscountActive && (minQty - qty <= 2)
    };
};