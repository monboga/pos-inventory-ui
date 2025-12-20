import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RefreshCw, Box, Tag, Image as ImageIcon, ToggleLeft, ToggleRight, FileText, Percent, Package, DollarSign } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { satService } from '../../services/satService';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSelect from '../common/AnimatedSelect';
import { discountService } from '../../services/discountService';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

const DEFAULT_SAT_VALUES = {
    IMPUESTO: '2', OBJETO_IMP: '2', CLAVE_PROD: '1', MEDIDA_LOCAL: '4', MEDIDA_SAT: '4'
};

// --- ANIMACIONES (Estilo ALBA) ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = {
    hidden: { scale: 0.95, y: 20, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } },
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } }
};

function ProductModal({ isOpen, onClose, onSubmit, productToEdit }) {
    const fileInputRef = useRef(null);
    const [discounts, setDiscounts] = useState([]);
    const [error, setError] = useState(null);

    // Datos
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
        isActive: true, image: '',
        discountId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    const handleFocus = (e) => e.target.select();

    // Cargar Catálogos
    useEffect(() => {
        if (isOpen && categories.length === 0) {
            const loadAllData = async () => {
                setLoadingData(true);
                try {
                    const [cats, imps, objs, prods, locals, sats, discs] = await Promise.all([
                        categoryService.getAll(),
                        satService.getImpuestos(),
                        satService.getObjetosImpuesto(),
                        satService.getClavesProdServ(),
                        satService.getMedidasLocales(),
                        satService.getMedidasSat(),
                        discountService.getAll()
                    ]);

                    // Formatear Categorías para AnimatedSelect
                    const formattedCats = cats
                        .filter(c => c.isActive || c.IsActive)
                        .map(c => ({ id: c.id || c.Id, name: c.description || c.Description }));
                    // Formatear Descuentos
                    const formattedDiscounts = discs
                        .filter(d => d.isActive)
                        .map(d => ({
                            id: d.id,
                            name: `${d.reason} (${d.percentage}%)`
                        }));
                    // Opción nula explícita para la UI
                    formattedDiscounts.unshift({ id: '', name: 'Sin descuento promocional' });
                    setDiscounts(formattedDiscounts);

                    setCategories(formattedCats);
                    setImpuestos(imps);
                    setObjetosImp(objs);
                    setClavesProd(prods);
                    setMedidasLocales(locals);
                    setMedidasSat(sats);
                } catch (e) {
                    console.error("Error catálogos", e);
                    toast.error("Error al cargar catálogos del sistema.");
                }
                finally { setLoadingData(false); }
            };
            loadAllData();
        }
    }, [isOpen]);

    // Inicializar Formulario
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setPhotoFile(null);
            if (productToEdit) {
                let existingPhoto = "";
                const rawPhoto = productToEdit.image || productToEdit.Image;
                if (rawPhoto) {
                    if (rawPhoto.includes("Uploads")) {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    } else existingPhoto = rawPhoto;
                }

                setFormData({
                    barcode: productToEdit.barcode || productToEdit.Barcode || '',
                    description: productToEdit.description || productToEdit.Description || '',
                    brand: productToEdit.brand || productToEdit.Brand || '',
                    stock: productToEdit.stock ?? productToEdit.Stock ?? 0,
                    price: productToEdit.price ?? productToEdit.Price ?? 0,
                    discount: productToEdit.discount ?? productToEdit.Discount ?? 0,
                    categoryId: productToEdit.categoryId || productToEdit.CategoryId || '',
                    catalogoImpuestoId: productToEdit.catalogoImpuestoId || productToEdit.CatalogoImpuestoId || DEFAULT_SAT_VALUES.IMPUESTO,
                    catalogoObjetoImpuestoId: productToEdit.catalogoObjetoImpuestoId || productToEdit.CatalogoObjetoImpuestoId || DEFAULT_SAT_VALUES.OBJETO_IMP,
                    claveProductoServicioId: productToEdit.claveProductoServicioId || productToEdit.ClaveProductoServicioId || DEFAULT_SAT_VALUES.CLAVE_PROD,
                    medidaLocalId: productToEdit.medidaLocalId || productToEdit.MedidaLocalId || DEFAULT_SAT_VALUES.MEDIDA_LOCAL,
                    medidaSatId: productToEdit.medidaSatId || productToEdit.MedidaSatId || DEFAULT_SAT_VALUES.MEDIDA_SAT,
                    isActive: (productToEdit.isActive !== undefined) ? productToEdit.isActive : (!!productToEdit.IsActive),
                    image: existingPhoto,
                    discountId: productToEdit.discountId || productToEdit.DiscountId || ''
                });
                setPhotoPreview(existingPhoto);
            } else {
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
    }, [isOpen, productToEdit]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validación manual Categoría
        if (!formData.categoryId || formData.categoryId === "" || formData.categoryId === "0") {
            toast.error("⚠️ Selecciona una categoría válida.");
            return;
        }

        const safeData = { ...formData };
        // Defaults SAT
        if (!safeData.catalogoImpuestoId) safeData.catalogoImpuestoId = DEFAULT_SAT_VALUES.IMPUESTO;
        if (!safeData.catalogoObjetoImpuestoId) safeData.catalogoObjetoImpuestoId = DEFAULT_SAT_VALUES.OBJETO_IMP;
        if (!safeData.claveProductoServicioId) safeData.claveProductoServicioId = DEFAULT_SAT_VALUES.CLAVE_PROD;
        if (!safeData.medidaLocalId) safeData.medidaLocalId = DEFAULT_SAT_VALUES.MEDIDA_LOCAL;
        if (!safeData.medidaSatId) safeData.medidaSatId = DEFAULT_SAT_VALUES.MEDIDA_SAT;
        if (safeData.discountId === '') safeData.discountId = null;


        try {
            await onSubmit({ ...safeData, photoFile });
            onClose();
        } catch (err) {
            console.error(err);
            const message = err.message || "Error al guardar.";
            toast.error(message);
            setError(message);
        }
    };

    // --- HELPERS PARA MAPEO SAT ---
    // Convierte los objetos complejos del SAT a {id, name} para AnimatedSelect
    const mapSatOptions = (data, keyId, keyDesc, keyCode) => {
        return data.map(item => ({
            id: item[keyId] || item[keyId.charAt(0).toUpperCase() + keyId.slice(1)],
            name: keyCode
                ? `${item[keyCode] || item[keyCode.charAt(0).toUpperCase() + keyCode.slice(1)]} - ${item[keyDesc] || item[keyDesc.charAt(0).toUpperCase() + keyDesc.slice(1)]}`
                : item[keyDesc] || item[keyDesc.charAt(0).toUpperCase() + keyDesc.slice(1)]
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* 1. BACKDROP (Fondo Oscuro) */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* 2. MODAL (Contenedor Blanco Sólido) */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-xl font-bold text-gray-800">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {/* BODY */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

                            {/* FOTO + DATOS PRINCIPALES */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative group cursor-pointer w-32 h-32" onClick={() => fileInputRef.current.click()}>
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full rounded-xl object-cover border-4 border-pink-100 shadow-sm bg-white" />
                                        ) : (
                                            <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <RefreshCw className="text-white" size={24} />
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Imagen</span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Código Barras <span className="text-gray-400 text-xs">(Opcional)</span></label>
                                            <div className="relative">
                                                <Box size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-gray-300"
                                                    value={formData.barcode}
                                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                                    placeholder="Ej. 750100..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    required
                                                    onFocus={handleFocus}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                                    value={formData.stock}
                                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej. Blister Mixto 0.07D"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-gray-300"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DETALLES */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                    <div className="relative">
                                        <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-gray-300"
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Ej. Nagaraku"
                                        />
                                    </div>
                                </div>

                                {/* CATEGORÍA ANIMADA */}
                                <div>
                                    <AnimatedSelect
                                        label={<>Categoría <span className="text-red-500">*</span></>}
                                        options={categories}
                                        value={formData.categoryId}
                                        onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                        icon={Tag}
                                        placeholder="Seleccionar..."
                                        disabled={loadingData}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            onFocus={handleFocus}
                                            className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <AnimatedSelect
                                        label="Descuento Promocional"
                                        options={discounts}
                                        value={formData.discountId}
                                        onChange={(val) => setFormData({ ...formData, discountId: val })}
                                        icon={Percent}
                                        placeholder="Seleccionar descuento..."
                                        disabled={loadingData}
                                    />
                                </div>
                            </div>

                            {/* SAT (5 Animated Selects) */}
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 pb-3 flex items-center gap-2">
                                    <FileText size={16} className="text-pink-500" /> Información Fiscal (SAT)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Usamos mapSatOptions para convertir los datos al formato {id, name} */}
                                    <AnimatedSelect
                                        label="Impuesto"
                                        options={mapSatOptions(impuestos, 'id', 'descripcion', 'claveImpuesto')}
                                        value={formData.catalogoImpuestoId}
                                        onChange={(v) => setFormData({ ...formData, catalogoImpuestoId: v })}
                                    />
                                    <AnimatedSelect
                                        label="Objeto Impuesto"
                                        options={mapSatOptions(objetosImp, 'id', 'descripcion', 'claveObjetoImp')}
                                        value={formData.catalogoObjetoImpuestoId}
                                        onChange={(v) => setFormData({ ...formData, catalogoObjetoImpuestoId: v })}
                                    />
                                    <AnimatedSelect
                                        label="Medida Local"
                                        options={mapSatOptions(medidasLocales, 'id', 'name', 'abbreviation')}
                                        value={formData.medidaLocalId}
                                        onChange={(v) => setFormData({ ...formData, medidaLocalId: v })}
                                    />
                                    <AnimatedSelect
                                        label="Medida SAT"
                                        options={mapSatOptions(medidasSat, 'id', 'nombre', 'claveUnidad')}
                                        value={formData.medidaSatId}
                                        onChange={(v) => setFormData({ ...formData, medidaSatId: v })}
                                    />
                                    <div className="md:col-span-2">
                                        <AnimatedSelect
                                            label="Clave Prod/Serv"
                                            options={mapSatOptions(clavesProd, 'id', 'descripcion', 'claveProdServ')}
                                            value={formData.claveProductoServicioId}
                                            onChange={(v) => setFormData({ ...formData, claveProductoServicioId: v })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ESTADO */}
                            {productToEdit && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">Estado del producto</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${formData.isActive
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}
                                    >
                                        {formData.isActive ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                                    </button>
                                </div>
                            )}

                            {/* FOOTER */}
                            <div className="pt-2 flex gap-3 justify-end border-t border-gray-50">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-all">
                                    {productToEdit ? <><RefreshCw size={18} /> Actualizar Producto</> : <><Save size={18} /> Guardar Producto</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default ProductModal;