import api from '../api/axiosConfig';

const BASE_ENDPOINT = '/api'; // Prefijo común

// Helper interno para no repetir try/catch
const fetchCatalog = async (endpoint) => {
    try {
        const response = await api.get(`${BASE_ENDPOINT}/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
};

export const satService = {
    getImpuestos: () => fetchCatalog('CatalogoImpuestos'),
    getObjetosImpuesto: () => fetchCatalog('CatalogoObjetoImpuestos'),
    getClavesProdServ: () => fetchCatalog('ClavesProductoServicio'),
    getMedidasLocales: () => fetchCatalog('MedidasLocales'),
    getMedidasSat: () => fetchCatalog('MedidasSat'),
    getRegimenesFiscales: () => fetchCatalog('RegimenesFiscales')
};