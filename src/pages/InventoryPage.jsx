import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion'; // 1. Importar animaciones
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import ProductModal from '../components/inventory/ProductModal';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Search, Plus, Edit, Trash2, Box, Package, AlertOctagon, Tag, Percent, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

// Variantes de animación estándar
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState({});

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Aumentado a 10
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);

            setProducts(productsData);

            const catMap = {};
            categoriesData.forEach(cat => {
                catMap[cat.id || cat.Id] = cat.description || cat.Description;
            });
            setCategoriesMap(catMap);

        } catch (error) {
            console.error(error);
            toast.error("Error al cargar inventario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async (formData) => {
        const toastId = toast.loading("Guardando producto...");
        try {
            if (currentProduct) {
                await productService.update(currentProduct.id || currentProduct.Id, formData);
                toast.success("Producto actualizado correctamente", { id: toastId });
            } else {
                await productService.create(formData);
                toast.success("Producto creado correctamente", { id: toastId });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Eliminar producto?</h3>
                    <p className="text-sm text-gray-500 mt-1">El inventario se actualizará.</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => { toast.dismiss(t.id); performDelete(id); }} className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"><span>Eliminar</span></button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    const performDelete = async (id) => {
        const toastId = toast.loading("Eliminando...");
        try {
            await productService.delete(id);
            toast.success("Producto eliminado", { id: toastId });
            loadData();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const openCreate = () => { setCurrentProduct(null); setIsModalOpen(true); };
    const openEdit = (prod) => { setCurrentProduct(prod); setIsModalOpen(true); };

    const columns = useMemo(() => [
        {
            header: "Producto",
            render: (row) => {
                let imgUrl = null;
                const rawImg = row.image || row.Image;
                if (rawImg) {
                    if (rawImg.includes("Uploads")) {
                        const cleanPath = rawImg.replace(/\\/g, '/');
                        const prefix = cleanPath.startsWith('/') ? '' : '/';
                        imgUrl = `${API_BASE_URL}${prefix}${cleanPath}`;
                    } else imgUrl = rawImg;
                }

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover" /> : <Box className="text-gray-300" size={24} />}
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">{row.description || row.Description}</div>
                            <div className="text-xs text-gray-500 font-mono">{row.barcode || row.Barcode}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Categoría",
            render: (row) => {
                const catId = row.categoryId || row.CategoryId;
                const catName = categoriesMap[catId] || "Sin Categoría";

                return (
                    <div className="flex items-center gap-2">
                        <Tag size={14} className="text-pink-400" />
                        <span className="text-gray-700 font-medium text-sm">{catName}</span>
                    </div>
                );
            }
        },
        {
            header: "Stock",
            className: "text-center",
            render: (row) => {
                const stockVal = row.stock !== undefined ? row.stock : (row.Stock !== undefined ? row.Stock : 0);
                if (stockVal === 0) {
                    return (
                        <div className="flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                                <AlertOctagon size={12} /> AGOTADO
                            </span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center gap-1">
                        <Package size={14} className="text-gray-400" />
                        <span className={`font-semibold ${stockVal < 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {stockVal}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Descuento",
            className: "text-center w-40",
            render: (row) => {
                const discount = row.discount || row.Discount;
                const percentage = row.discountPercentage || row.DiscountPercentage || discount?.percentage || discount?.Percentage || 0;
                const minQty = discount?.minQuantity || discount?.MinQuantity || 1;
                const isBulk = minQty > 1;

                if (percentage > 0) {
                    return (
                        <div className="flex justify-center">
                            {isBulk ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200" title={`Aplica a partir de ${minQty} piezas`}>
                                    <Layers size={12} /> 
                                    <span>{minQty}+ : -{Number(percentage)}%</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                                    <Percent size={12} /> -{Number(percentage)}%
                                </span>
                            )}
                        </div>
                    );
                }
                return <div className="text-center"><span className="text-xs text-gray-400 italic">Sin descuento</span></div>;
            }
        },
        {
            header: "Precio",
            className: "text-right font-medium text-gray-700",
            render: (row) => {
                const priceVal = row.price !== undefined ? row.price : (row.Price !== undefined ? row.Price : 0);
                return `$${Number(priceVal).toFixed(2)}`;
            }
        },
        {
            header: "Estado",
            className: "text-center",
            render: (row) => {
                const active = row.isActive !== undefined ? row.isActive : (row.IsActive !== undefined ? !!row.IsActive : false);
                return active ? <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Activo</span> : <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">Inactivo</span>;
            }
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(row)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    {(row.isActive !== undefined ? row.isActive : row.IsActive) && (
                        <button onClick={() => handleDelete(row.id || row.Id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    )}
                </div>
            )
        }
    ], [categoriesMap]);

    const filtered = products.filter(p => {
        const term = searchTerm.toLowerCase();
        const desc = (p.description || p.Description || "").toLowerCase();
        const code = (p.barcode || p.Barcode || "").toLowerCase();
        const catId = p.categoryId || p.CategoryId;
        const catName = (categoriesMap[catId] || "").toLowerCase();

        return desc.includes(term) || code.includes(term) || catName.includes(term);
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        // 1. WRAPPER PRINCIPAL
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            
            {/* 2. HEADER FULL WIDTH (Pegado arriba) */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestion de Inventario">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar producto..." 
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all" 
                                value={searchTerm} 
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            />
                        </div>
                        <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                            <Plus size={18} />
                            <span>Nuevo Producto</span>
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

            <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} productToEdit={currentProduct} />
        </div>
    );
}

export default InventoryPage;