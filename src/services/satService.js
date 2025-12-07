import { apiFetch } from "./api";

const BASE_URL = 'https://localhost:7031/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const fetchCatalog = async (endpoint) => {
    try {
        const response = await apiFetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            console.warn(`Falló la carga de: ${endpoint}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
};

export const satService = {
    // 1. Catálogo Impuestos (Endpoint según tu Swagger)
    getImpuestos: () => fetchCatalog('CatalogoImpuestos'),

    // 2. Objeto Impuesto
    getObjetosImpuesto: () => fetchCatalog('CatalogoObjetoImpuestos'),

    // 3. Claves Prod/Serv
    getClavesProdServ: () => fetchCatalog('ClavesProductoServicio'),

    // 4. Medidas Locales
    getMedidasLocales: () => fetchCatalog('MedidasLocales'),

    // 5. Medidas SAT
    getMedidasSat: () => fetchCatalog('MedidasSat'),

    getRegimenesFiscales: () => fetchCatalog('RegimenesFiscales')
};