import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Package } from 'lucide-react';

const ProductSearchModal = ({ isOpen, onClose, products, onAddToCart }) => {
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);

    // Auto-foco al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery(""); // Limpiar al abrir
        }
    }, [isOpen]);

    // Filtrado local optimizado
    const results = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return products.filter(p => 
            (p.description || p.name || "").toLowerCase().includes(lowerQuery) ||
            (p.barcode || "").includes(lowerQuery)
        ).slice(0, 10); // Limitar a 10 resultados para velocidad
    }, [query, products]);

    // Handler para agregar y cerrar (opcional: quitar onClose si quieres permitir multi-add)
    const handleAdd = (product) => {
        onAddToCart(product);
        onClose(); // Cerramos al seleccionar (flujo rápido)
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    
                    {/* 1. BACKDROP BLUR (Clic para cerrar) */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
                    />

                    {/* 2. MODAL "SPOTLIGHT" */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh]"
                    >
                        {/* Header con Input Grande */}
                        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                            <Search className="text-pink-500" size={28} />
                            <input 
                                ref={inputRef}
                                type="text" 
                                placeholder="Buscar producto..." 
                                className="w-full text-2xl font-bold text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button 
                                onClick={onClose}
                                className="p-2 bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Lista de Resultados */}
                        <div className="overflow-y-auto custom-scrollbar bg-gray-50/50 p-2">
                            {results.length > 0 ? (
                                <div className="space-y-2">
                                    {results.map((product) => (
                                        <motion.button
                                            key={product.id || product.Id}
                                            onClick={() => handleAdd(product)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="w-full bg-white hover:bg-pink-50 p-3 rounded-2xl border border-gray-100 hover:border-pink-200 shadow-sm flex items-center gap-4 transition-all group text-left"
                                        >
                                            {/* Imagen Miniatura */}
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                {product.image ? (
                                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-pink-600 transition-colors">
                                                    {product.description || product.name}
                                                </h4>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    Stock: {product.stock} pzs
                                                </p>
                                            </div>

                                            {/* Precio y Acción */}
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-900 text-lg">
                                                    ${Number(product.price).toFixed(2)}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 group-hover:bg-pink-500 group-hover:text-white flex items-center justify-center transition-all">
                                                    <Plus size={18} />
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                                    {query ? (
                                        <p>No se encontraron resultados para "{query}"</p>
                                    ) : (
                                        <>
                                            <Search size={40} className="opacity-20 mb-2" />
                                            <p className="text-sm font-medium">Escribe para buscar...</p>
                                            <div className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded text-gray-500 font-mono">
                                                Tip: Presiona Esc para cerrar
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductSearchModal;