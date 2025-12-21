import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import es from 'date-fns/locale/es';

registerLocale('es', es);

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: {
        scale: 1, opacity: 1, y: 0,
        transition: { type: "spring", stiffness: 350, damping: 25 }
    },
    exit: { scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.15 } }
};

// FIX: Recibimos initialStartDate e initialEndDate
function DateRangeModal({ isOpen, onClose, onApply, initialStartDate, initialEndDate }) {
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    // FIX: Sincronizar estado cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setDateRange([initialStartDate || null, initialEndDate || null]);
        }
    }, [isOpen, initialStartDate, initialEndDate]);

    const formatDateDisplay = (date) => {
        if (!date) return "--/--/----";
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getRangeLabel = () => {
        if (!startDate && !endDate) return "Selecciona un rango"; // Texto por defecto
        if (!startDate) return "Selecciona fecha de inicio";
        const options = { day: 'numeric', month: 'long', year: 'numeric' };

        if (!endDate) {
            return `Desde: ${startDate.toLocaleDateString('es-MX', options)}`;
        }
        return `${startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-MX', options)}`;
    };

    const handleApply = () => {
        onApply(startDate, endDate);
        onClose();
    };

    // FIX: "Limpiar" ahora elimina el filtro y cierra
    const handleClear = () => {
        setDateRange([null, null]);
        onApply(null, null); // Enviamos nulls para resetear la tabla
        onClose();
    };

    // FIX: Validar botón aplicar.
    // Habilitado si: (Están ambos seleccionados) O (Están ambos vacíos -> sirve para confirmar limpieza)
    // Deshabilitado si: (Solo hay uno seleccionado -> rango incompleto)
    const isApplyDisabled = (startDate && !endDate);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose}
                    />

                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col w-full max-w-3xl"
                        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-pink-50 p-2 rounded-lg text-pink-500 shadow-sm"><Calendar size={20} /></span>
                                Filtrar por Fecha
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition-all"><X size={20} /></button>
                        </div>

                        {/* Layout Split */}
                        <div className="flex flex-col md:flex-row h-full">

                            {/* IZQUIERDA: CALENDARIO */}
                            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-white flex flex-col justify-center items-center">
                                <div className="w-full flex justify-center">
                                    <DatePicker
                                        selectsRange={true}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(update) => setDateRange(update)}
                                        inline
                                        locale="es"
                                        calendarClassName="!shadow-none !border-none"
                                    />
                                </div>

                                <div className="mt-6 w-full text-center">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 ${startDate
                                            ? 'bg-pink-50 text-pink-600 border border-pink-100'
                                            : 'bg-gray-50 text-gray-400 border border-gray-100'
                                        }`}>
                                        {startDate ? <Check size={12} strokeWidth={3} /> : <Calendar size={12} />}
                                        {getRangeLabel()}
                                    </span>
                                </div>
                            </div>

                            {/* DERECHA: CONFIRMACIÓN */}
                            <div className="p-6 flex flex-col justify-center gap-6 flex-1 bg-gray-50/50">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Confirmación</h4>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Inicio</p>
                                            <div className={`text-sm font-bold flex items-center gap-2 ${startDate ? 'text-gray-800' : 'text-gray-300'}`}>
                                                <Calendar size={14} className={startDate ? "text-pink-500" : "text-gray-300"} />
                                                {formatDateDisplay(startDate)}
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fin</p>
                                            <div className={`text-sm font-bold flex items-center gap-2 ${endDate ? 'text-gray-800' : 'text-gray-300'}`}>
                                                <ArrowRight size={14} className={endDate ? "text-pink-500" : "text-gray-300"} />
                                                {formatDateDisplay(endDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-200/50">
                                    <button
                                        onClick={handleClear}
                                        className="px-4 py-3 text-sm text-gray-500 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-xl font-bold transition-all flex items-center gap-2"
                                        title="Borrar selección y ver todo"
                                    >
                                        <Trash2 size={18} />
                                        Quitar Filtro
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        disabled={isApplyDisabled}
                                        className="flex-1 py-3 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        <Check size={18} strokeWidth={3} />
                                        Aplicar Filtro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default DateRangeModal;