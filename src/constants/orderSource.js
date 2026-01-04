import { Monitor, Globe, HelpCircle } from 'lucide-react';

// Nombres exactos que devuelve tu Backend (OrderSource.Name)
export const ORDER_SOURCES = {
    POS: 'Pos',
    WEB: 'Web'
};

// Configuración Visual
export const SOURCE_CONFIG = {
    [ORDER_SOURCES.POS]: {
        label: 'Punto de Venta',
        shortLabel: 'Local',
        icon: Monitor,
        color: 'bg-pink-100 text-pink-600 border-pink-200'
    },
    [ORDER_SOURCES.WEB]: {
        label: 'Tienda Online',
        shortLabel: 'Web',
        icon: Globe,
        color: 'bg-blue-50 text-blue-600 border-blue-100'
    }
};

/**
 * Helper para obtener la configuración de la fuente.
 * Maneja mayúsculas/minúsculas por seguridad.
 */
export const getSourceConfig = (sourceName) => {
    if (!sourceName) return SOURCE_CONFIG[ORDER_SOURCES.POS];

    // Normalizamos búsqueda (Ej: "pos", "POS", "Pos" -> Match)
    const normalizedKey = Object.keys(SOURCE_CONFIG).find(
        key => key.toLowerCase() === sourceName.toLowerCase()
    );

    return SOURCE_CONFIG[normalizedKey] || {
        label: sourceName,
        shortLabel: sourceName,
        icon: HelpCircle,
        color: 'bg-gray-50 text-gray-400'
    };
};