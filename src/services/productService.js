import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api/products';

export const productService = {
    getAll: async () => {
        const response = await api.get(BASE_ENDPOINT);
        return response.data;
    },

    // Obtener uno por ID (Útil para edición)
    getById: async (id) => {
        const response = await api.get(`${BASE_ENDPOINT}/${id}`);
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

        // Relación con Descuento (Correcto: enviamos vacío si es null)
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

        // Relación con Descuento
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

    // --- NUEVO: Actualización rápida de stock (Patch) ---
    // Útil si quieres añadir un botón "+10 stock" en el inventario sin abrir el formulario completo
    updateStock: async (id, quantity) => {
        // Asegúrate de tener un endpoint PATCH en el backend: [HttpPatch("{id}/stock")]
        const response = await api.patch(`${BASE_ENDPOINT}/${id}/stock`, { quantity });
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`${BASE_ENDPOINT}/${id}`);
        return true;
    }
};