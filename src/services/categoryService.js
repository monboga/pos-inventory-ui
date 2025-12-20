import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/categories';

export const categoryService = {
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
    },

    create: async (categoryData) => {
        // FIX: Agregar DiscountId al payload
        const payload = {
            Description: categoryData.description,
            IsActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
            DiscountId: categoryData.discountId // <--- AGREGADO
        };
        const response = await api.post(BASE_ENDPOINT, payload);
        return response.data;
    },

    update: async (id, categoryData) => {
        // FIX: Agregar DiscountId al payload
        const payload = {
            Id: id,
            Description: categoryData.description || categoryData.Description,
            IsActive: categoryData.isActive,
            DiscountId: categoryData.discountId // <--- AGREGADO
        };
        const response = await api.put(`${BASE_ENDPOINT}/${id}`, payload);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    }
};