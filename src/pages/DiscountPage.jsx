import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Percent, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import DiscountModal from '../components/discounts/DiscountModal';
import { discountService } from '../services/discountService';
import toast from 'react-hot-toast';

// 1. Variantes de animación simplificadas (Más estables)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.05 } 
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1, 
        transition: { duration: 0.3 } 
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

function DiscountsPage() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    const loadDiscounts = async () => {
        setLoading(true);
        try {
            const data = await discountService.getAll();
            setDiscounts(data);
        } catch (error) {
            toast.error("Error al cargar descuentos");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDiscounts(); }, []);

    const handleSave = async (discountData) => {
        const toastId = toast.loading("Guardando...");
        try {
            if (editingDiscount) {
                await discountService.update(editingDiscount.id, { ...discountData, id: editingDiscount.id });
                toast.success("Descuento actualizado", { id: toastId });
            } else {
                await discountService.create(discountData);
                toast.success("Descuento creado", { id: toastId });
            }
            setIsModalOpen(false);
            loadDiscounts();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar", { id: toastId });
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Eliminar descuento?</h3>
                    <p className="text-sm text-gray-500 mt-1">Se eliminará de los productos asociados.</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => { toast.dismiss(t.id); performDelete(id); }} className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"><span>Eliminar</span></button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    const performDelete = async (id) => {
        try {
            await discountService.delete(id);
            toast.success("Regla eliminada");
            loadDiscounts();
        } catch (error) {
            toast.error("No se pudo eliminar");
        }
    };

    const openCreateModal = () => { setEditingDiscount(null); setIsModalOpen(true); };
    const openEditModal = (discount) => { setEditingDiscount(discount); setIsModalOpen(true); };

    // Filtrado seguro (accede a Mayúsculas o minúsculas según venga del backend)
    const filteredDiscounts = discounts.filter(d => {
        const name = d.name || d.Name || d.reason || d.Reason || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        // 1. WRAPPER PRINCIPAL (Estructura Full Width como en Dashboard)
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            
            {/* 2. HEADER FULL WIDTH */}
            <div className="flex-shrink-0">
                <PageHeader title="Descuentos">
                    {/* INPUT Y BOTÓN COMO CHILDREN DEL HEADER */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar promoción..." 
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <button 
                            onClick={openCreateModal}
                            className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={18} /> <span>Nuevo Descuento</span>
                        </button>
                    </div>
                </PageHeader>
            </div>

            {/* 3. CONTENIDO PRINCIPAL (Con Padding) */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Grid de Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredDiscounts.map((discount) => {
                            // --- LECTURA SEGURA DE DATOS (Inline Fix) ---
                            // Esto arregla que las tarjetas se vean vacías o blancas
                            const id = discount.id || discount.Id;
                            const minQty = Number(discount.minQuantity || discount.MinQuantity || 1);
                            const percentage = Number(discount.percentage || discount.Percentage || 0);
                            const name = discount.name || discount.Name || discount.reason || discount.Reason || "Sin nombre";
                            const isActive = discount.isActive !== undefined ? discount.isActive : (discount.IsActive !== undefined ? discount.IsActive : true);

                            // Lógica visual
                            const isBulk = minQty > 1;
                            const bgIcon = isBulk ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600';
                            const borderHover = isBulk ? 'group-hover:border-blue-200' : 'group-hover:border-pink-200';
                            
                            return (
                                <motion.div 
                                    key={id}
                                    variants={itemVariants}
                                    initial="hidden" 
                                    animate="visible"
                                    exit="exit"
                                    // ELIMINAMOS 'layout' AQUÍ -> ESTO SOLUCIONA EL BUG VISUAL DE "NO APARECE"
                                    className={`
                                        bg-white rounded-2xl p-6 border border-gray-100 shadow-sm 
                                        transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden
                                        ${!isActive ? 'opacity-60 grayscale' : ''}
                                        ${borderHover}
                                    `}
                                >
                                    {/* Decoración Fondo */}
                                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${isBulk ? 'bg-blue-500' : 'bg-pink-500'}`}></div>

                                    {/* Encabezado Card */}
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`p-3 rounded-xl ${bgIcon} transition-colors`}>
                                            {isBulk ? <Layers size={24} strokeWidth={2.5} /> : <Percent size={24} strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => openEditModal(discount)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                            <button onClick={() => handleDelete(id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    </div>

                                    {/* Info Principal */}
                                    <div className="relative z-10">
                                        <h3 className="text-base font-bold text-gray-700 mb-1 truncate" title={name}>
                                            {name}
                                        </h3>
                                        
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className={`text-4xl font-black ${isBulk ? 'text-blue-600' : 'text-pink-500'}`}>
                                                {percentage}%
                                            </span>
                                            <span className="text-sm font-bold text-gray-400">OFF</span>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {isBulk ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Layers size={12}/> Mayoreo ({minQty}+)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-50 text-pink-700 border border-pink-100">
                                                    <Percent size={12}/> Directo
                                                </span>
                                            )}
                                            
                                            {!isActive && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredDiscounts.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-60">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Sparkles size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">No se encontraron descuentos</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                            Crea una nueva regla de promoción o ajusta tu búsqueda.
                        </p>
                    </div>
                )}
            </motion.div>

            <DiscountModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                discountToEdit={editingDiscount}
            />
        </div>
    );
}

export default DiscountsPage;