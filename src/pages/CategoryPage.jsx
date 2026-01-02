import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion'; // 1. Importar animaciones
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import CategoryModal from '../components/categories/CategoryModal';
import { categoryService } from '../services/categoryService';
import { Search, Plus, Edit, Trash2, Tag, Percent, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

// Variantes de animación estándar
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Aumentado a 10 para aprovechar espacio
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    const handleSave = async (formData) => {
        const toastId = toast.loading("Guardando...");
        try {
            if (currentCategory) {
                await categoryService.update(currentCategory.id || currentCategory.Id, formData);
                toast.success("Categoría actualizada", { id: toastId });
            } else {
                await categoryService.create(formData);
                toast.success("Categoría creada", { id: toastId });
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Eliminar categoría?</h3>
                    <p className="text-sm text-gray-500 mt-1">Esta acción es permanente.</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { toast.dismiss(t.id); performDelete(id); }}
                        className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                background: '#ffffff',
                color: '#1f2937',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #f3f4f6'
            },
            icon: null
        });
    };

    const performDelete = async (id) => {
        const toastId = toast.loading("Eliminando...");
        try {
            await categoryService.delete(id);
            toast.success("Categoría eliminada", { id: toastId });
            loadCategories();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const openCreateModal = () => { setCurrentCategory(null); setIsModalOpen(true); };
    const openEditModal = (cat) => { setCurrentCategory(cat); setIsModalOpen(true); };

    const columns = useMemo(() => [
        {
            header: "Descripción",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
                        <Tag size={16} />
                    </div>
                    <span className="font-bold text-gray-700">{row.description || row.Description}</span>
                </div>
            )
        },
        {
            header: "Descuento Base",
            className: "text-center w-40",
            render: (row) => {
                const discountObj = row.discount || row.Discount;
                const percentage = Number(
                    discountObj?.percentage || discountObj?.Percentage || 
                    row.discountPercentage || row.DiscountPercentage || 0
                );
                const minQty = discountObj?.minQuantity || discountObj?.MinQuantity || 1;
                const isBulk = minQty > 1;

                if (percentage > 0) {
                    return (
                        <div className="flex justify-center">
                            {isBulk ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200" title={`Aplica a partir de ${minQty} piezas`}>
                                    <Layers size={12} /> 
                                    <span>{minQty}+ : -{percentage}%</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                                    <Percent size={12} /> -{percentage}%
                                </span>
                            )}
                        </div>
                    );
                }
                return <div className="text-center"><span className="text-xs text-gray-400 italic">Sin descuento</span></div>;
            }
        },
        {
            header: "Estado",
            className: "text-center w-32",
            render: (row) => {
                const isActive = row.isActive !== undefined ? row.isActive : (row.IsActive !== undefined ? !!row.IsActive : false);
                return (
                    <div className="flex justify-center">
                        {isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>Activo</span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>Inactivo</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Acciones",
            className: "text-right w-32",
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(row)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(row.id || row.Id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                </div>
            )
        }
    ], []);

    const filteredData = categories.filter(item => {
        const desc = (item.description || item.Description || "").toLowerCase();
        return desc.includes(searchTerm.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        // 1. WRAPPER PRINCIPAL
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            
            {/* 2. HEADER FULL WIDTH */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestion de categorías">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar categoría..." 
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all" 
                                value={searchTerm} 
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            />
                        </div>
                        <button onClick={openCreateModal} className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                            <Plus size={18} />
                            <span>Nueva Categoría</span>
                        </button>
                    </div>
                </PageHeader>
            </div>

            {/* 3. CONTENIDO PRINCIPAL (Centrado y limitado) */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full">
                    <DynamicTable
                        columns={columns}
                        data={currentData}
                        loading={loading}
                        pagination={{ currentPage, totalPages }}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </motion.div>

            <CategoryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSave} 
                categoryToEdit={currentCategory} 
            />
        </div>
    );
}

export default CategoryPage;