// src/utils/imageUtils.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

/**
 * Normaliza la URL de una imagen proveniente del backend.
 * Evita duplicar el dominio si ya existe.
 */
export const getNormalizedImageUrl = (img) => {
    if (!img) return null;

    // 1. Si es Base64, retornar tal cual
    if (img.startsWith('data:')) return img;

    // 2. FIX CRÍTICO: Si ya empieza con nuestra URL base, NO hacer nada.
    // Esto soluciona el bug de "https://localhost.../https://localhost..."
    if (img.startsWith(API_BASE_URL)) return img;

    // 3. Si es una URL externa (ej. cloudinary, imgur), retornar tal cual
    if (img.startsWith('http://') || img.startsWith('https://')) return img;

    // 4. Si es una ruta relativa del servidor (carpeta Uploads)
    if (img.includes("Uploads")) {
        // Corregir barras invertidas de Windows
        const cleanPath = img.replace(/\\/g, '/');
        // Asegurar que empiece con / para concatenar bien
        const prefix = cleanPath.startsWith('/') ? '' : '/';
        return `${API_BASE_URL}${prefix}${cleanPath}`;
    }

    // 5. Fallback
    return img;
};