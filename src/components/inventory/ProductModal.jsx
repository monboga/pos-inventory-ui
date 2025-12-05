import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Box, Tag, DollarSign, Image as ImageIcon, Camera, ToggleLeft, ToggleRight, Barcode, FileText } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { satService } from '../../services/satService';

const API_BASE_URL = 'https://localhost:7031';

const DEFAULT_SAT_VALUES = {
    IMPUESTO: '2', OBJETO_IMP: '2', CLAVE_PROD: '1', MEDIDA_LOCAL: '4', MEDIDA_SAT: '4'
};

function ProductModal({ isOpen, onClose, onSubmit, productToEdit }) {
    const fileInputRef = useRef(null);

    const [categories, setCategories] = useState([]);
    const [impuestos, setImpuestos] = useState([]);
    const [objetosImp, setObjetosImp] = useState([]);
    const [clavesProd, setClavesProd] = useState([]);
    const [medidasLocales, setMedidasLocales] = useState([]);
    const [medidasSat, setMedidasSat] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const initialFormState = {
        barcode: '', description: '', brand: '', stock: 0, price: 0, discount: 0,
        categoryId: '',
        catalogoImpuestoId: '', catalogoObjetoImpuestoId: '', claveProductoServicioId: '', medidaLocalId: '', medidaSatId: '',
        isActive: true, image: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // --- Helper Robusto para IDs ---
    const extractId = (obj, keyBase) => {
        if (!obj) return '';
        // Intenta leer PropiedadId o propiedadId
        let val = obj[keyBase + 'Id'] || obj[keyBase.charAt(0).toUpperCase() + keyBase.slice(1) + 'Id'];
        // Intenta leer objeto anidado Propiedad.Id
        if (!val && obj[keyBase]) val = obj[keyBase].id || obj[keyBase].Id;
        const keyPascal = keyBase.charAt(0).toUpperCase() + keyBase.slice(1);
        if (!val && obj[keyPascal]) val = obj[keyPascal].id || obj[keyPascal].Id;

        return val ? String(val) : '';
    };

    // 1. CARGA DE DATOS
    useEffect(() => {
        if (isOpen && categories.length === 0) {
            const loadAllData = async () => {
                setLoadingData(true);
                try {
                    const [cats, imps, objs, prods, locals, sats] = await Promise.all([
                        categoryService.getAll(),
                        satService.getImpuestos(),
                        satService.getObjetosImpuesto(),
                        satService.getClavesProdServ(),
                        satService.getMedidasLocales(),
                        satService.getMedidasSat()
                    ]);
                    setCategories(cats); setImpuestos(imps); setObjetosImp(objs);
                    setClavesProd(prods); setMedidasLocales(locals); setMedidasSat(sats);
                } catch (e) { console.error("Error catálogos", e); }
                finally { setLoadingData(false); }
            };
            loadAllData();
        }
    }, [isOpen]);

    // 2. RELLENADO DE FORMULARIO
    useEffect(() => {
        if (isOpen) {
            setPhotoFile(null);

            if (productToEdit) {
                // === MODO EDICIÓN ===

                // Imagen
                let existingPhoto = "";
                const rawPhoto = productToEdit.image || productToEdit.Image;
                if (rawPhoto) {
                    if (rawPhoto.includes("Uploads")) {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    } else existingPhoto = rawPhoto;
                }

                // --- FIX CATEGORÍA ---
                // Buscamos exhaustivamente el ID de la categoría y lo convertimos a String
                let foundCatId = extractId(productToEdit, 'category'); // Usa el helper inteligente

                // --- FIX ESTADO (Active) ---
                // Verifica todas las variantes posibles: isActive (bool), IsActive (bit/int)
                let activeState = true;
                if (productToEdit.isActive !== undefined) activeState = productToEdit.isActive;
                else if (productToEdit.IsActive !== undefined) activeState = !!productToEdit.IsActive; // !! convierte 1 a true, 0 a false

                setFormData({
                    barcode: productToEdit.barcode || productToEdit.Barcode || '',
                    description: productToEdit.description || productToEdit.Description || '',
                    brand: productToEdit.brand || productToEdit.Brand || '',
                    stock: productToEdit.stock ?? productToEdit.Stock ?? 0,
                    price: productToEdit.price ?? productToEdit.Price ?? 0,
                    discount: productToEdit.discount ?? productToEdit.Discount ?? 0,

                    // AQUI EL CAMBIO CLAVE:
                    // Leemos directo el ID que agregamos al ProductVm
                    categoryId: productToEdit.categoryId || productToEdit.CategoryId || '',

                    catalogoImpuestoId: productToEdit.catalogoImpuestoId || productToEdit.CatalogoImpuestoId || DEFAULT_SAT_VALUES.IMPUESTO,
                    catalogoObjetoImpuestoId: productToEdit.catalogoObjetoImpuestoId || productToEdit.CatalogoObjetoImpuestoId || DEFAULT_SAT_VALUES.OBJETO_IMP,
                    claveProductoServicioId: productToEdit.claveProductoServicioId || productToEdit.ClaveProductoServicioId || DEFAULT_SAT_VALUES.CLAVE_PROD,
                    medidaLocalId: productToEdit.medidaLocalId || productToEdit.MedidaLocalId || DEFAULT_SAT_VALUES.MEDIDA_LOCAL,
                    medidaSatId: productToEdit.medidaSatId || productToEdit.MedidaSatId || DEFAULT_SAT_VALUES.MEDIDA_SAT,

                    // Lógica de IsActive (Manejo robusto de mayúsculas/minúsculas)
                    isActive: (productToEdit.isActive !== undefined) ? productToEdit.isActive : (!!productToEdit.IsActive),

                    image: existingPhoto
                });
                setPhotoPreview(existingPhoto);

            } else {
                // === MODO CREAR ===
                setFormData({
                    ...initialFormState,
                    categoryId: '',
                    catalogoImpuestoId: DEFAULT_SAT_VALUES.IMPUESTO,
                    catalogoObjetoImpuestoId: DEFAULT_SAT_VALUES.OBJETO_IMP,
                    claveProductoServicioId: DEFAULT_SAT_VALUES.CLAVE_PROD,
                    medidaLocalId: DEFAULT_SAT_VALUES.MEDIDA_LOCAL,
                    medidaSatId: DEFAULT_SAT_VALUES.MEDIDA_SAT,
                    isActive: true
                });
                setPhotoPreview(null);
            }
        }
    }, [isOpen, productToEdit]); // Removida la dependencia loadingData para asegurar lectura inmediata de productToEdit

    const compressImageToFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image(); img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 500;
                    let width = img.width; let height = img.height;
                    if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
                    else { if (height > MAX) { width *= MAX / height; height = MAX; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

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

        if (!formData.categoryId || formData.categoryId === "" || formData.categoryId === "0") {
            alert("⚠️ Selecciona una categoría válida.");
            return;
        }

        const safeData = { ...formData };
        // Fallbacks si están vacíos
        if (!safeData.catalogoImpuestoId) safeData.catalogoImpuestoId = DEFAULT_SAT_VALUES.IMPUESTO;
        if (!safeData.catalogoObjetoImpuestoId) safeData.catalogoObjetoImpuestoId = DEFAULT_SAT_VALUES.OBJETO_IMP;
        if (!safeData.claveProductoServicioId) safeData.claveProductoServicioId = DEFAULT_SAT_VALUES.CLAVE_PROD;
        if (!safeData.medidaLocalId) safeData.medidaLocalId = DEFAULT_SAT_VALUES.MEDIDA_LOCAL;
        if (!safeData.medidaSatId) safeData.medidaSatId = DEFAULT_SAT_VALUES.MEDIDA_SAT;

        onSubmit({ ...safeData, photoFile });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                    <h2 className="text-xl font-bold text-gray-800">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* SECCIÓN 1: IMAGEN Y DATOS BÁSICOS */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group cursor-pointer w-32 h-32" onClick={() => fileInputRef.current.click()}>
                                {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full rounded-xl object-cover border-4 border-pink-100 shadow-sm" /> : <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400"><ImageIcon size={32} /></div>}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Imagen</span>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label><input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" required className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Nombre</label><input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: DETALLES */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Marca</label><input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} /></div>

                        {/* SELECT CATEGORÍA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none bg-white focus:ring-2 focus:ring-pink-500 ${!formData.categoryId ? 'border-red-300' : 'border-gray-200'}`}
                                    value={String(formData.categoryId)}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id || cat.Id} value={String(cat.id || cat.Id)}>
                                            {cat.description || cat.Description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio</label><input type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Desc.</label><input type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: SAT (Igual) */}
                    <div className="pt-4 border-t border-gray-100">
                        {/* ... Mismo bloque SAT de siempre ... */}
                        <h3 className="text-sm font-bold text-gray-900 pb-3 flex items-center gap-2"><FileText size={16} /> Información Fiscal (SAT)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div><label className="block text-xs text-gray-500 mb-1">Impuesto</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none" value={String(formData.catalogoImpuestoId)} onChange={e => setFormData({ ...formData, catalogoImpuestoId: e.target.value })}>{impuestos.map(i => <option key={i.id || i.Id} value={String(i.id || i.Id)}>{i.claveImpuesto || i.ClaveImpuesto} - {i.descripcion || i.Descripcion}</option>)}</select></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Obj Impuesto</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none" value={String(formData.catalogoObjetoImpuestoId)} onChange={e => setFormData({ ...formData, catalogoObjetoImpuestoId: e.target.value })}>{objetosImp.map(o => <option key={o.id || o.Id} value={String(o.id || o.Id)}>{o.claveObjetoImp || o.ClaveObjetoImp} - {o.descripcion || o.Descripcion}</option>)}</select></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Medida Local</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none" value={String(formData.medidaLocalId)} onChange={e => setFormData({ ...formData, medidaLocalId: e.target.value })}>{medidasLocales.map(m => <option key={m.id || m.Id} value={String(m.id || m.Id)}>{m.abbreviation || m.Abbreviation} - {m.name || m.Name}</option>)}</select></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Medida SAT</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none" value={String(formData.medidaSatId)} onChange={e => setFormData({ ...formData, medidaSatId: e.target.value })}>{medidasSat.map(m => <option key={m.id || m.Id} value={String(m.id || m.Id)}>{m.claveUnidad || m.ClaveUnidad} - {m.nombre || m.Nombre}</option>)}</select></div>
                            <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Clave Prod</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none" value={String(formData.claveProductoServicioId)} onChange={e => setFormData({ ...formData, claveProductoServicioId: e.target.value })}>{clavesProd.map(c => <option key={c.id || c.Id} value={String(c.id || c.Id)}>{c.claveProdServ || c.ClaveProdServ} - {c.descripcion || c.Descripcion}</option>)}</select></div>
                        </div>
                    </div>

                    {/* --- TOGGLE ESTADO (Solo Editar) --- */}
                    {productToEdit && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Estado del producto</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${formData.isActive
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}
                            >
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