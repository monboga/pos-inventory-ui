import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import CategoryModal from '../components/categories/CategoryModal';
import { categoryService } from '../services/categoryService';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Ajustable

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    // Carga de datos
    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    // Handlers
    const handleSave = async (formData) => {
        try {
            if (currentCategory) {
                await categoryService.update(currentCategory.id || currentCategory.Id, formData);
            } else {
                await categoryService.create(formData);
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await categoryService.delete(id);
                loadCategories();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const openCreateModal = () => { setCurrentCategory(null); setIsModalOpen(true); };
    const openEditModal = (cat) => { setCurrentCategory(cat); setIsModalOpen(true); };

    // --- CONFIGURACIÓN DE COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: "Descripción",
            render: (row) => (
                <div className="font-bold text-gray-800">
                    {row.description || row.Description}
                </div>
            )
        },
        {
            header: "Estado",
            className: "text-center",
            render: (row) => {
                const isActive = row.isActive !== undefined ? row.isActive : row.IsActive;
                return isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        Inactivo
                    </span>
                );
            }
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(row)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(row.id || row.Id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ], []);

    // --- FILTRADO Y PAGINACIÓN ---
    const filteredData = categories.filter(item => {
        const desc = (item.description || item.Description || "").toLowerCase();
        return desc.includes(searchTerm.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            {/* Header Optimizado (Aprovechando espacios) */}
            <PageHeader title="Categorías">
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
                    <button 
                        onClick={openCreateModal} 
                        className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span>Nueva Categoría</span>
                    </button>
                </div>
            </PageHeader>

            {/* Tabla Dinámica */}
            <div className="flex-grow flex flex-col min-h-0">
                <DynamicTable 
                    columns={columns} 
                    data={currentData} 
                    loading={loading}
                    pagination={{ currentPage, totalPages }}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Modal */}
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