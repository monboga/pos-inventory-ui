import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
// Importamos la lógica de normalización de fecha si fuera necesario, 
// aunque para cálculos matemáticos directos usaremos la lógica de UTC-Z.

const OrderTimer = ({ expirationDate, onExpire }) => {
    const calculateTimeLeft = () => {
        if (!expirationDate) return null;

        // 1. Consistencia con dateUtils: Forzar interpretación UTC
        const expDateStr = expirationDate.endsWith('Z') ? expirationDate : `${expirationDate}Z`;
        const expiration = new Date(expDateStr).getTime();
        const now = new Date().getTime();
        
        const difference = expiration - now;
        
        if (difference > 0) {
            // 2. Cálculo mejorado para soportar 24h o más
            // Usamos Math.floor total para las horas sin el módulo % 24 
            // si quieres mostrar "25:00:00", o con % 24 si prefieres días aparte.
            // Para POS, usualmente basta con horas acumuladas.
            return {
                hours: Math.floor(difference / (1000 * 60 * 60)), 
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                totalSeconds: Math.floor(difference / 1000)
            };
        }
        return null; 
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        // Resetear estado si la fecha de expiración cambia
        setIsExpired(false);
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            if (!left) {
                setIsExpired(true);
                clearInterval(timer);
                if (onExpire) onExpire();
            } else {
                setTimeLeft(left);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expirationDate]);

    if (isExpired) {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                <AlertTriangle size={12} /> Expirado
            </span>
        );
    }

    if (!timeLeft) return null;

    // Urgente si queda menos de 5 minutos
    const isUrgent = timeLeft.totalSeconds < 300; 
    
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
            isUrgent 
            ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' 
            : 'bg-gray-50 text-gray-500 border-gray-100'
        }`}>
            <Clock size={12} className={isUrgent ? 'animate-spin-slow' : ''} />
            <span className="text-[11px] font-black font-mono tracking-tighter">
                {/* Mostramos las horas siempre con 2 dígitos, ideal para lapsos de 24h */}
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

export default OrderTimer;