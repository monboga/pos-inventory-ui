import React, { useState, useEffect } from 'react';
import { Save, LayoutList, ChevronDown, Trash2 } from 'lucide-react'; // Agregamos Trash2 si quieres borrar
import { viewService } from '../../services/viewService';
import SaveViewModal from './SaveViewModal';
import toast from 'react-hot-toast';

function ViewSelector({ entityName, currentFilters, onApplyView }) {
    const [views, setViews] = useState([]);
    const [selectedViewId, setSelectedViewId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadViews();
    }, [entityName]);

    const loadViews = async () => {
        try {
            const data = await viewService.getViewsByEntity(entityName);
            setViews(data);
        } catch (error) {
            console.error("Error cargando vistas", error);
        }
    };

    const handleViewChange = (e) => {
        const viewId = e.target.value;
        setSelectedViewId(viewId);

        if (viewId === "") {
            onApplyView(null);
        } else {
            const view = views.find(v => String(v.id) === String(viewId));
            if (view && view.configurationJson) { // FIX: Usar configurationJson
                try {
                    const parsedFilters = JSON.parse(view.configurationJson);
                    onApplyView(parsedFilters);
                } catch (err) {
                    toast.error("Error al leer la configuración de la vista");
                }
            }
        }
    };

    const handleSaveView = async (viewName) => {
        const toastId = toast.loading("Guardando vista...");
        try {
            // --- FIX CRÍTICO: NOMBRES DE PROPIEDADES ---
            // Deben coincidir con CreateUserViewCommand.cs
            const payload = {
                name: viewName,
                resource: entityName,        // Antes era 'entity', ahora 'resource'
                configurationJson: JSON.stringify(currentFilters) // Antes 'filtersJson', ahora 'configurationJson'
            };

            await viewService.createView(payload);
            
            toast.success("Vista guardada exitosamente", { id: toastId });
            await loadViews(); // Recargar lista para ver la nueva
            
            // Opcional: Auto-seleccionar la vista recién creada si el backend devolviera el objeto completo
            // Pero con recargar la lista es suficiente por ahora.
            
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la vista. Verifica los datos.", { id: toastId });
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-4 w-fit animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center pl-3 pr-1 text-gray-400">
                    <LayoutList size={18} />
                </div>
                
                <div className="relative">
                    <select 
                        value={selectedViewId} 
                        onChange={handleViewChange}
                        className="appearance-none bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer py-2 pl-1 pr-8 min-w-[180px] outline-none"
                    >
                        <option value="">-- Vista Predeterminada --</option>
                        {views.length > 0 && <option disabled>──────────</option>}
                        {views.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="w-px h-6 bg-gray-200 mx-1"></div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors m-1"
                >
                    <Save size={14} />
                    <span>Guardar Vista</span>
                </button>
            </div>

            <SaveViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveView} 
            />
        </>
    );
}

export default ViewSelector;