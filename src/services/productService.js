import { getToken } from './authService';

const API_URL = 'https://localhost:7031/api/products'; // Ajusta el endpoint

// Headers para GET/DELETE (JSON)
const getJsonHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Headers para POST/PUT (FormData - Sin Content-Type explícito)
const getFormDataHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`
    };
};

export const productService = {
    getAll: async () => {
        const response = await fetch(API_URL, { headers: getJsonHeaders() });
        if (!response.ok) throw new Error('Error al cargar productos');
        return await response.json();
    },

    create: async (productData) => {
        const formData = new FormData();
        
        // Campos de Texto/Números
        formData.append('Barcode', productData.barcode);
        formData.append('Description', productData.description);
        formData.append('Brand', productData.brand);
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('Discount', productData.discount || 0);
        formData.append('IsActive', true); // Siempre activo al crear

        // Llaves Foráneas (Asegúrate de que coincidan con tu DTO)
        formData.append('CategoryId', productData.categoryId);
        formData.append('MedidaLocalId', productData.medidaLocalId || 1); // Default o input
        formData.append('MedidaSatId', productData.medidaSatId || 1);
        formData.append('CatalogoImpuestoId', productData.catalogoImpuestoId || 1);
        formData.append('CatalogoObjetoImpuestoId', productData.catalogoObjetoImpuestoId || 1);
        formData.append('ClaveProductoServicioId', productData.claveProductoServicioId || 1);

        // Imagen (Archivo real)
        if (productData.photoFile) {
            formData.append('Image', productData.photoFile); // Ojo: Tu BD dice 'Image', no 'Photo'
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
        
        // Mismos campos que create
        formData.append('Barcode', productData.barcode);
        formData.append('Description', productData.description);
        formData.append('Brand', productData.brand);
        formData.append('Stock', productData.stock);
        formData.append('Price', productData.price);
        formData.append('Discount', productData.discount);
        formData.append('IsActive', productData.isActive);
        
        formData.append('CategoryId', productData.categoryId);
        // ... Agregar resto de IDs si son editables ...

        if (productData.photoFile) {
            formData.append('Image', productData.photoFile);
        }

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getFormDataHeaders(),
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.title || 'Error al actualizar producto');
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