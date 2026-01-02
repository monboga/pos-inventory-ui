import { useState, useEffect } from 'react';
import { satService } from '../../services/satService';
import { currencyService } from '../../services/currencyService';
import toast from 'react-hot-toast';

export const useBusinessCatalogs = (isOpen) => {
    const [regimenes, setRegimenes] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && regimenes.length === 0) {
            const load = async () => {
                try {
                    setLoading(true);
                    const [regimenData, currencyData] = await Promise.all([
                        satService.getRegimenesFiscales(),
                        currencyService.getAll()
                    ]);
                    setRegimenes(regimenData);
                    setCurrencies(currencyData);
                } catch (error) {
                    console.error(error);
                    toast.error("Error al cargar catálogos");
                } finally {
                    setLoading(false);
                }
            };
            load();
        }
    }, [isOpen, regimenes.length]);

    // Mapeo defensivo: Lee id o Id, code o Code, etc.
    const regimenOptions = regimenes.map(r => ({ 
        id: r.id || r.Id, 
        name: `${r.code || r.Code} - ${r.description || r.Description}` 
    }));
    
    const currencyOptions = currencies.map(c => ({ 
        id: c.id || c.Id, 
        name: `${c.name || c.Name} (${c.code || c.Code})` 
    }));

    return { regimenOptions, currencyOptions, loading };
};