import { useState } from 'react';

export function useEditMode(initialData, setParentData) {
    const [isEditing, setIsEditing] = useState(false);
    const [snapshot, setSnapshot] = useState(initialData);

    const startEditing = () => {
        setSnapshot({ ...initialData }); // Guardamos copia
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setParentData(snapshot); // Restauramos
        setIsEditing(false);
    };

    const stopEditing = () => {
        setIsEditing(false);
    };

    // Helper para saber si hay cambios reales
    const hasChanges = JSON.stringify(initialData) !== JSON.stringify(snapshot);

    return {
        isEditing,
        startEditing,
        cancelEditing,
        stopEditing,
        hasChanges
    };
}