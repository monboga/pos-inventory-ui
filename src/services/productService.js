import { getToken } from './authService';

const API_URL = 'https://localhost:7031/api/products'; 

const getJsonHeaders = () => {
    const token = getToken();
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

const getFormDataHeaders = () => {
    const token = getToken();
    return { 'Authorization': `Bearer ${token}` };
};

export const productService = {
    getAll: async () => {
        const response = await fetch(API_URL, { headers: getJsonHeaders() });
        if (!response.ok) throw new Error('Error al cargar productos');
        return await response.json();
    },

    create: async (productData) => {
        const formData = new FormData();
        
        formData.append('Barcode', productData.barcode);
        formData.append('Description', productData.description);
        formData.append('Brand', productData.brand);
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('Discount', productData.discount || 0);
        formData.append('CategoryId', productData.categoryId);
        formData.append('IsActive', true); // Siempre true al crear

        // SAT
        formData.append('CatalogoImpuestoId', productData.catalogoImpuestoId);
        formData.append('CatalogoObjetoImpuestoId', productData.catalogoObjetoImpuestoId);
        formData.append('ClaveProductoServicioId', productData.claveProductoServicioId);
        formData.append('MedidaLocalId', productData.medidaLocalId);
        formData.append('MedidaSatId', productData.medidaSatId);

        if (productData.photoFile) {
            formData.append('ImageFile', productData.photoFile);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getFormDataHeaders(),
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
        formData.append('Barcode', productData.barcode);
        formData.append('Description', productData.description);
        formData.append('Brand', productData.brand);
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('Discount', productData.discount || 0);
        formData.append('CategoryId', productData.categoryId);
        
        // --- FIX ESTADO: Enviar valor booleano explícito ---
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

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getFormDataHeaders(),
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
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getJsonHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
        return true;
    }
};