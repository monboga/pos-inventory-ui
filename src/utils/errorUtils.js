export const getFriendlyErrorMessage = (error) => {
    if (!error) return "Ocurrió un error desconocido.";

    const message = typeof error === 'string' ? error : error.message || "";

    // 1. Error de conexión (Backend caído o sin internet)
    if (message.includes("Failed to fetch") || message.includes("Network Error")) {
        return "No se pudo conectar con el servidor. Verifica que el servidor esté encendido.";
    }

    // 2. Errores comunes de Auth
    if (message.includes("401") || message.includes("Unauthorized")) {
        return "Credenciales incorrectas. Verifique su correo y contraseña.";
    }

    if (message.includes("403")) {
        return "No tienes permisos para realizar esta acción.";
    }

    if (message.includes("500")) {
        return "Error interno del servidor. Contacte a soporte.";
    }

    // Retorno por defecto (el mensaje original si no cae en los anteriores)
    return message;
};