import { useMemo } from 'react';
import { getItemFinancials } from '../../utils/financials';

export const useOrderCalculations = (cart) => {
    const orderSummary = useMemo(() => {
        return cart.reduce((acc, item) => {
            const financials = getItemFinancials(item);
            acc.total += financials.lineTotal;
            acc.savings += financials.savings;
            acc.count += item.quantity;
            return acc;
        }, { total: 0, savings: 0, count: 0 });
    }, [cart]);

    return { orderSummary };
};