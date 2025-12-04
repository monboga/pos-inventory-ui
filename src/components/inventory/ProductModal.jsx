import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Box, Tag, DollarSign, Image as ImageIcon, Camera, Layers, ToggleLeft, ToggleRight, Barcode } from 'lucide-react';
import { categoryService } from '../../services/categoryService'; // Importamos categorías

const API_BASE_URL = 'https://localhost:7031';

function ProductModal({ isOpen, onClose, onSubmit, productToEdit }) {
    const fileInputRef = useRef(null);
    const [categories, setCategories] = useState([]);
    
    const initialFormState = {
        barcode: '',
        description: '',
        brand: '',
        stock: 0,
        price: 0,
        discount: 0,
        categoryId: '',
        // Valores por defecto para IDs complejos (puedes cambiarlos a inputs si los necesitas editar)
        medidaLocalId: 1, 
        medidaSatId: 1,
        catalogoImpuestoId: 1,
        catalogoObjetoImpuestoId: 1,
        claveProductoServicioId: 1,
        isActive: true,
        image: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // --- Cargar Categorías ---
    useEffect(() => {
        if (isOpen) {
            const fetchCats = async () => {
                try {
                    const data = await categoryService.getAll();
                    setCategories(data);
                } catch (e) { console.error(e); }
            };
            fetchCats();
        }
    }, [isOpen]);

    // --- Compresión de Imagen (Misma que usuarios) ---
    const compressImageToFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500; const MAX_HEIGHT = 500;
                    let width = img.width; let height = img.height;
                    if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                    else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    // --- Rellenar Datos ---
    useEffect(() => {
        if (isOpen) {
            setPhotoFile(null);
            if (productToEdit) {
                // Fix URL Imagen
                let existingPhoto = "";
                const rawPhoto = productToEdit.image || productToEdit.Image;
                if (rawPhoto) {
                    if (rawPhoto.includes("Uploads")) {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    } else {
                        existingPhoto = rawPhoto; // Fallback
                    }
                }

                setFormData({
                    barcode: productToEdit.barcode || productToEdit.Barcode || '',
                    description: productToEdit.description || productToEdit.Description || '',
                    brand: productToEdit.brand || productToEdit.Brand || '',
                    stock: productToEdit.stock || productToEdit.Stock || 0,
                    price: productToEdit.price || productToEdit.Price || 0,
                    discount: productToEdit.discount || productToEdit.Discount || 0,
                    categoryId: productToEdit.categoryId || productToEdit.CategoryId || '',
                    isActive: productToEdit.isActive !== undefined ? productToEdit.isActive : true,
                    image: existingPhoto
                });
                setPhotoPreview(existingPhoto);
            } else {
                setFormData(initialFormState);
                setPhotoPreview(null);
            }
        }
    }, [isOpen, productToEdit]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            const compressed = await compressImageToFile(file);
            setPhotoFile(compressed);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, photoFile });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Sección Superior: Imagen y Datos Principales */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Columna Imagen */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group cursor-pointer w-32 h-32" onClick={() => fileInputRef.current.click()}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full rounded-xl object-cover border-4 border-pink-100 shadow-sm" />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-colors">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Imagen del producto</span>
                        </div>

                        {/* Columna Datos 1 */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                                <div className="relative">
                                    <Barcode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Nombre</label>
                                <div className="relative">
                                    <Box size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Detalles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <div className="relative">
                                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id || cat.Id} value={cat.id || cat.Id}>{cat.description || cat.Description}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="number" step="0.01" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input type="number" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento</label>
                                <input type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Toggle Estado (Solo editar) */}
                    {productToEdit && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Estado del producto</span>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {formData.isActive ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                            </button>
                        </div>
                    )}

                    <div className="pt-2 flex gap-3 justify-end border-t border-gray-50">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium shadow-sm active:scale-95 transition-all"><Save size={18} /> Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductModal;