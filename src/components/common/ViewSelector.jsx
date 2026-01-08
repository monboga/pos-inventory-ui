import React, { useState, useEffect } from 'react';
import { Save, LayoutList } from 'lucide-react'; 
import { viewService } from '../../services/viewService';
import SaveViewModal from './SaveViewModal';
import AnimatedSelect from '../common/AnimatedSelect'; // <--- Importamos nuestro componente estrella
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

    // Adaptamos el handler para recibir el valor directo del AnimatedSelect
    const handleViewChange = (viewId) => {
        setSelectedViewId(viewId);

        if (viewId === "") {
            // Restaurar vista por defecto (sin filtros)
            onApplyView(null);
        } else {
            const view = views.find(v => String(v.id) === String(viewId));
            if (view && view.configurationJson) {
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
            const payload = {
                name: viewName,
                resource: entityName,
                configurationJson: JSON.stringify(currentFilters)
            };

            await viewService.createView(payload);
            
            toast.success("Vista guardada exitosamente", { id: toastId });
            await loadViews(); 
            
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la vista.", { id: toastId });
        }
    };

    // Preparamos las opciones para el AnimatedSelect
    // Agregamos manualmente la opción "Default" al principio
    const selectOptions = [
        { id: "", name: "Vista Predeterminada" }, 
        ...views
    ];

    return (
        <>
            {/* CONTENEDOR FLOTANTE A LA DERECHA */}
            {/* justify-end: Empuja todo a la derecha. items-center: Alineación vertical. */}
            <div className="flex items-center gap-2">
                
                {/* 1. SELECTOR DE VISTAS */}
                {/* Le damos un ancho fijo (w-64) para que se vea uniforme */}
                <div className="w-56 md:w-64 z-20"> 
                    <AnimatedSelect
                        label="" // Sin label externo para ser minimalista
                        icon={LayoutList} // Icono dentro del input
                        options={selectOptions}
                        value={selectedViewId}
                        onChange={handleViewChange}
                        placeholder="Seleccionar Vista"
                    />
                </div>

                {/* 2. BOTÓN GUARDAR */}
                {/* Diseño independiente 'Outline' que combina con el select */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="
                        flex items-center gap-2 px-4 h-10 
                        bg-white border border-gray-200 
                        text-pink-600 font-bold text-sm rounded-xl 
                        hover:bg-pink-50 hover:border-pink-200 hover:shadow-sm 
                        transition-all active:scale-95 whitespace-nowrap
                    "
                    title="Guardar filtros actuales como nueva vista"
                >
                    <Save size={18} />
                    <span className='hidden xl:inline'>Guardar Vista</span>
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