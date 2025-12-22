import React from 'react';
import { Clock, CheckCircle, Package, XCircle } from 'lucide-react';

const OrderTimeline = ({ status }) => {
    // Definimos los pasos lógicos del flujo feliz
    const steps = [
        { id: 'Pending', label: 'Recibido', icon: Clock },
        { id: 'Confirmed', label: 'Confirmado', icon: CheckCircle },
        { id: 'Completed', label: 'Entregado', icon: Package }
    ];

    // Mapeamos el estatus actual a un índice numérico (0, 1, 2)
    // Si el estatus es "Pending", el index es 0.
    // Si es "Confirmed", el index es 1.
    // Si es "Completed", el index es 2.
    let activeStepIndex = steps.findIndex(s => s.id === status);
    
    // Verificamos si es un estado de "Fallo" (Cancelado o Expirado)
    const isFailed = status === 'Cancelled' || status === 'Expired';

    // Si está fallido, reseteamos el índice para no mostrar la barra verde equivocada
    if (isFailed) activeStepIndex = -1; 

    return (
        <div className="w-full py-6 px-4">
            {isFailed ? (
                // --- VISTA DE ERROR (Cancelado/Expirado) ---
                <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-700 border border-red-100 animate-pulse">
                    <XCircle size={28} />
                    <div>
                        <p className="font-bold text-lg">Pedido {status === 'Expired' ? 'Expirado' : 'Cancelado'}</p>
                        <p className="text-sm opacity-80">
                            {status === 'Expired' 
                                ? 'El tiempo de espera para el pago finalizó.' 
                                : 'Este pedido ha sido cancelado manualmente.'}
                        </p>
                    </div>
                </div>
            ) : (
                // --- VISTA DE LÍNEA DE TIEMPO (Progreso Normal) ---
                <div className="relative flex justify-between items-center w-full max-w-xs mx-auto">
                    
                    {/* Línea Gris de Fondo (Trayectoria completa) */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />
                    
                    {/* Línea Verde de Progreso (Dinámica según estatus) */}
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-700 ease-out"
                        style={{ 
                            // Cálculo del ancho: 
                            // Pending (0) -> 0%
                            // Confirmed (1) -> 50%
                            // Completed (2) -> 100%
                            width: `${(activeStepIndex / (steps.length - 1)) * 100}%` 
                        }}
                    />

                    {/* Renderizado de los Puntos (Steps) */}
                    {steps.map((step, index) => {
                        const isActive = index <= activeStepIndex; // Pasos ya completados o actual
                        const isCurrent = index === activeStepIndex; // El paso exacto actual
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-1">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                                    ${isActive 
                                        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 scale-110' 
                                        : 'bg-white border-gray-200 text-gray-300'}
                                `}>
                                    <step.icon size={18} />
                                </div>
                                <span className={`
                                    text-[10px] font-bold uppercase transition-colors duration-300 tracking-wider
                                    ${isActive ? 'text-green-600' : 'text-gray-400'}
                                `}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderTimeline;