import { apiFetch } from './api';

const API_URL = 'https://localhost:7031/api/products'; 

export const productService = {
    getAll: async () => {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar productos');
        return await response.json();
    },

    create: async (productData) => {
        const formData = new FormData();

        // formData.append('Barcode', productData.barcode);
        formData.append('Description', productData.description);
        // formData.append('Brand', productData.brand);
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('Discount', productData.discount || 0);
        formData.append('CategoryId', productData.categoryId);
        formData.append('IsActive', true); 

        // SAT
        formData.append('CatalogoImpuestoId', productData.catalogoImpuestoId);
        formData.append('CatalogoObjetoImpuestoId', productData.catalogoObjetoImpuestoId);
        formData.append('ClaveProductoServicioId', productData.claveProductoServicioId);
        formData.append('MedidaLocalId', productData.medidaLocalId);
        formData.append('MedidaSatId', productData.medidaSatId);

        if (productData.photoFile) {
            formData.append('ImageFile', productData.photoFile);
        }

        // apiFetch detecta FormData y evita el content-type json
        const response = await apiFetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al crear producto');
        }
        return await response.json();
    },

    update: async (id, productData) => {
        const formData = new FormData();

        formData.append('Id', id);
        // formData.append('Barcode', productData.barcode);
        formData.append('Description', productData.description);
        // formData.append('Brand', productData.brand);
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('Discount', productData.discount || 0);
        formData.append('CategoryId', productData.categoryId);
        formData.append('IsActive', productData.isActive);

        // SAT
        formData.append('CatalogoImpuestoId', productData.catalogoImpuestoId);
        formData.append('CatalogoObjetoImpuestoId', productData.catalogoObjetoImpuestoId);
        formData.append('ClaveProductoServicioId', productData.claveProductoServicioId);
        formData.append('MedidaLocalId', productData.medidaLocalId);
        formData.append('MedidaSatId', productData.medidaSatId);

        if (productData.photoFile) {
            formData.append('ImageFile', productData.photoFile);
        }

        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            let msg = error.title || 'Error al actualizar';
            if (error.errors) msg += `: ${JSON.stringify(error.errors)}`;
            throw new Error(msg);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};
    },

    delete: async (id) => {
        const response = await apiFetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
        return true;
    }
};