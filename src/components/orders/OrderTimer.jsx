import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const OrderTimer = ({ expirationDate, onExpire }) => {
    const calculateTimeLeft = () => {
        // 1. Convertimos la fecha de expiración (que viene del server) a un objeto Date.
        // Si el string no trae 'Z', le añadimos 'Z' para forzar al navegador a leerlo como UTC.
        const expDateStr = expirationDate.endsWith('Z') ? expirationDate : `${expirationDate}Z`;
        const expiration = new Date(expDateStr).getTime();
        
        // 2. Obtenemos el "Ahora" en timestamp (que siempre es UTC internamente en JS)
        const now = new Date().getTime();
        
        const difference = expiration - now;
        
        if (difference > 0) {
            return {
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                totalSeconds: Math.floor(difference / 1000)
            };
        }
        return null; // Expirado
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
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

    // Estilo visual: Urgente si quedan menos de 5 minutos
    const isUrgent = timeLeft.totalSeconds < 300; 
    
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
            isUrgent 
            ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' 
            : 'bg-gray-50 text-gray-500 border-gray-100'
        }`}>
            <Clock size={12} className={isUrgent ? 'animate-spin-slow' : ''} />
            <span className="text-[11px] font-black font-mono tracking-tighter">
                {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

export default OrderTimer;