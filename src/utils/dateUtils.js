/**
 * Convierte una fecha UTC del servidor a la fecha/hora local del usuario.
 * @param {string} dateString - Fecha ISO (ej. 2025-12-30T01:53:22)
 * @param {object} options - Opciones de formato Intl.DateTimeFormat
 */
export const formatDateTime = (dateString, options = {}) => {
    if (!dateString) return '-';

    // 1. Asegurar que el string se interprete como UTC
    // Si el backend manda "2025-12-30T01:00:00" sin la 'Z' al final, 
    // JS cree que es local. Le pegamos la 'Z' si falta para forzar UTC.
    const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    
    const date = new Date(utcString);

    // 2. Configuración por defecto (Español México, formato legible)
    const defaultOptions = {
        day: '2-digit',
        month: 'short', // 'dic'
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // AM/PM
        ...options // Sobrescribir si mandan opciones extra
    };

    // 3. Convertir a local
    return new Intl.DateTimeFormat('es-MX', defaultOptions).format(date);
};

/**
 * Solo fecha (sin hora)
 */
export const formatDate = (dateString) => {
    return formatDateTime(dateString, { 
        hour: undefined, 
        minute: undefined, 
        hour12: undefined 
    });
};

/**
 * Solo hora
 */
export const formatTime = (dateString) => {
    return formatDateTime(dateString, { 
        day: undefined, 
        month: undefined, 
        year: undefined 
    });
};