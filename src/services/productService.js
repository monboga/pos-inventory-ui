import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/products';

export const productService = {
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
    },

    create: async (productData) => {
        const formData = new FormData();

        formData.append('Barcode', productData.barcode || '');
        formData.append('Description', productData.description);
        formData.append('Brand', productData.brand || '');
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('CategoryId', productData.categoryId);
        formData.append('IsActive', true);

        // FIX: Agregar DiscountId
        // Nota: Para FormData y .NET, enviamos cadena vacía si es null
        formData.append('DiscountId', productData.discountId || '');

        // Campos SAT
        formData.append('CatalogoImpuestoId', productData.catalogoImpuestoId);
        formData.append('CatalogoObjetoImpuestoId', productData.catalogoObjetoImpuestoId);
        formData.append('ClaveProductoServicioId', productData.claveProductoServicioId);
        formData.append('MedidaLocalId', productData.medidaLocalId);
        formData.append('MedidaSatId', productData.medidaSatId);

        if (productData.photoFile) {
            formData.append('ImageFile', productData.photoFile);
        }

        try {
            const response = await api.post(BASE_ENDPOINT, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            throw new Error(errorData.title || errorData.message || 'Error al crear producto');
        }
    },

    update: async (id, productData) => {
        const formData = new FormData();

        formData.append('Id', id);
        formData.append('Barcode', productData.barcode || '');
        formData.append('Description', productData.description);
        formData.append('Brand', productData.brand || '');
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('CategoryId', productData.categoryId);
        formData.append('IsActive', productData.isActive);

        // FIX: Agregar DiscountId en Update también
        formData.append('DiscountId', productData.discountId || '');

        // SAT
        formData.append('CatalogoImpuestoId', productData.catalogoImpuestoId);
        formData.append('CatalogoObjetoImpuestoId', productData.catalogoObjetoImpuestoId);
        formData.append('ClaveProductoServicioId', productData.claveProductoServicioId);
        formData.append('MedidaLocalId', productData.medidaLocalId);
        formData.append('MedidaSatId', productData.medidaSatId);

        if (productData.photoFile) {
            formData.append('ImageFile', productData.photoFile);
        }

        try {
            const response = await api.put(`${BASE_ENDPOINT}/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || {};
            let msg = errorData.title || 'Error al actualizar';
            if (errorData.errors) msg += `: ${JSON.stringify(errorData.errors)}`;
            throw new Error(msg);
        }
    },

    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    }
};