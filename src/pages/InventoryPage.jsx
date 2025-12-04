import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import ProductModal from '../components/inventory/ProductModal';
import { productService } from '../services/productService';
import { Search, Plus, Edit, Trash2, Box, Package } from 'lucide-react';

const API_BASE_URL = 'https://localhost:7031';

function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Mostramos un poco más porque las filas son más compactas

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const handleSave = async (formData) => {
        try {
            if (currentProduct) {
                await productService.update(currentProduct.id || currentProduct.Id, formData);
            } else {
                await productService.create(formData);
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await productService.delete(id);
                loadProducts();
            } catch (error) { alert(error.message); }
        }
    };

    const openCreate = () => { setCurrentProduct(null); setIsModalOpen(true); };
    const openEdit = (prod) => { setCurrentProduct(prod); setIsModalOpen(true); };

    // --- COLUMNAS ---
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
                    } else {
                        imgUrl = rawImg;
                    }
                }

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Box className="text-gray-300" size={24} />
                            )}
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
            header: "Marca",
            accessor: "brand", // O row.Brand
            render: (row) => row.brand || row.Brand
        },
        {
            header: "Stock",
            className: "text-center",
            render: (row) => (
                <div className="flex items-center justify-center gap-1">
                    <Package size={14} className="text-gray-400" />
                    <span className={`font-semibold ${(row.stock || row.Stock) < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                        {row.stock || row.Stock}
                    </span>
                </div>
            )
        },
        {
            header: "Precio",
            className: "text-right font-medium text-gray-700",
            render: (row) => `$${(row.price || row.Price).toFixed(2)}`
        },
        {
            header: "Estado",
            className: "text-center",
            render: (row) => {
                const active = row.isActive !== undefined ? row.isActive : row.IsActive;
                return active ? (
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Activo</span>
                ) : (
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">Inactivo</span>
                );
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
    ], []);

    const filtered = products.filter(p => {
        const term = searchTerm.toLowerCase();
        const desc = (p.description || p.Description || "").toLowerCase();
        const code = (p.barcode || p.Barcode || "").toLowerCase();
        return desc.includes(term) || code.includes(term);
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <PageHeader title="Inventario">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Buscar producto..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"><Plus size={18} /><span>Nuevo Producto</span></button>
                </div>
            </PageHeader>

            <div className="flex-grow flex flex-col min-h-0">
                <DynamicTable columns={columns} data={currentData} loading={loading} pagination={{ currentPage, totalPages }} onPageChange={setCurrentPage} />
            </div>

            <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} productToEdit={currentProduct} />
        </div>
    );
}

export default InventoryPage;