import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Percent, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscountModal from '../components/discounts/DiscountModal'; // Ruta ajustada
import { discountService } from '../services/discountService';
import toast from 'react-hot-toast';

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
        try {
            if (editingDiscount) {
                await discountService.update(editingDiscount.id, { ...discountData, id: editingDiscount.id });
                toast.success("Descuento actualizado correctamente");
            } else {
                await discountService.create(discountData);
                toast.success("Nuevo descuento creado");
            }
            setIsModalOpen(false);
            loadDiscounts();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la regla");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este descuento? Se quitará de todos los productos asociados.")) return;
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

    const filteredDiscounts = discounts.filter(d => 
        (d.name || d.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Descuentos</h1>
                    <p className="text-gray-500 mt-1 font-medium">Gestiona promociones directas y reglas de mayoreo</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={20} strokeWidth={3} /> Nuevo Descuento
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                <Search className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre de promoción..." 
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredDiscounts.map((discount) => {
                        // Lógica visual: Si es mayoreo (>1), usa tema Azul. Si es directo, usa tema Rosa.
                        const isBulk = discount.minQuantity > 1;
                        const themeColor = isBulk ? 'blue' : 'pink';
                        
                        // Clases dinámicas basadas en el tema
                        const bgIcon = isBulk ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600';
                        const borderHover = isBulk ? 'group-hover:border-blue-200' : 'group-hover:border-pink-200';
                        
                        return (
                            <motion.div 
                                key={discount.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`
                                    bg-white rounded-2xl p-6 border border-gray-100 shadow-sm 
                                    transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden
                                    ${!discount.isActive ? 'opacity-60 grayscale' : ''}
                                    ${borderHover}
                                `}
                            >
                                {/* Decoración de fondo sutil */}
                                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${isBulk ? 'bg-blue-500' : 'bg-pink-500'}`}></div>

                                {/* Encabezado Card */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`p-3 rounded-xl ${bgIcon} transition-colors`}>
                                        {isBulk ? <Layers size={24} strokeWidth={2.5} /> : <Percent size={24} strokeWidth={2.5} />}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => openEditModal(discount)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDelete(discount.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                </div>

                                {/* Info Principal */}
                                <div className="relative z-10">
                                    <h3 className="text-base font-bold text-gray-700 mb-1 truncate" title={discount.name || discount.reason}>
                                        {discount.name || discount.reason}
                                    </h3>
                                    
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className={`text-4xl font-black ${isBulk ? 'text-blue-600' : 'text-pink-500'}`}>
                                            {discount.percentage}%
                                        </span>
                                        <span className="text-sm font-bold text-gray-400">OFF</span>
                                    </div>

                                    {/* Badges de Estado */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isBulk ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                <Layers size={12}/> Mayoreo ({discount.minQuantity}+)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-50 text-pink-700 border border-pink-100">
                                                <Percent size={12}/> Directo
                                            </span>
                                        )}
                                        
                                        {!discount.isActive && (
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