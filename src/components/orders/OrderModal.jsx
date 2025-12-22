import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Save } from 'lucide-react';
import { productService } from '../../services/productService'; // Reutilizamos
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const OrderModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Productos, 2: Datos Cliente
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    
    // Datos Cliente (Value Object para el backend)
    const [contact, setContact] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);

    // Cargar productos al abrir
    useEffect(() => {
        if (isOpen) {
            loadProducts();
            setStep(1);
            setCart([]);
            setContact({ name: '', phone: '' });
        }
    }, [isOpen]);

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data.filter(p => p.isActive && p.stock > 0));
        } catch (error) {
            toast.error("Error cargando productos");
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                if(exists.quantity >= product.stock) return prev;
                return prev.map(p => p.id === product.id ? {...p, quantity: p.quantity + 1} : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleSubmit = async () => {
        if (!contact.name) return toast.error("El nombre del cliente es obligatorio");
        if (cart.length === 0) return toast.error("El pedido debe tener productos");

        setLoading(true);
        try {
            const payload = {
                source: 1, // 1 = POS/Admin (Interno)
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
                contactName: contact.name,
                contactPhone: contact.phone
                // Nota: Podrías agregar clientId si quisieras ligarlo a un cliente registrado
            };

            await orderService.create(payload);
            toast.success("Pedido creado manualmente");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-2xl z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800">Nuevo Pedido Manual</h2>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Panel Izquierdo: Selección Productos */}
                    <div className="flex-1 p-4 border-r border-gray-100 flex flex-col overflow-hidden">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input 
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="Buscar producto..."
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {products
                                .filter(p => p.description.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(product => (
                                    <div key={product.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors cursor-pointer" onClick={() => addToCart(product)}>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{product.description}</p>
                                            <p className="text-xs text-gray-400">Stock: {product.stock} | ${product.price}</p>
                                        </div>
                                        <button className="text-pink-500 hover:bg-pink-50 p-1 rounded"><Plus size={16}/></button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Panel Derecho: Resumen y Cliente */}
                    <div className="w-full md:w-80 bg-gray-50 p-4 flex flex-col overflow-hidden">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Resumen</h3>
                        
                        {/* Lista Carrito Mini */}
                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-sm bg-white p-2 rounded border border-gray-100">
                                    <div className="flex-1">
                                        <p className="line-clamp-1 font-medium">{item.description}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} x ${item.price}</p>
                                    </div>
                                    <div className="text-right pl-2">
                                        <p className="font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                                        <button 
                                            onClick={() => setCart(prev => prev.filter(p => p.id !== item.id))}
                                            className="text-red-400 hover:text-red-600 text-[10px] underline"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center text-lg font-bold text-gray-800 mb-4 border-t border-gray-200 pt-2">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Formulario Cliente */}
                        <div className="space-y-3 bg-white p-3 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase">Nombre Cliente *</label>
                                <input 
                                    className="w-full text-sm border-b border-gray-200 py-1 focus:border-pink-500 outline-none"
                                    placeholder="Ej. Cliente Telefónico"
                                    value={contact.name} onChange={e => setContact({...contact, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase">Teléfono</label>
                                <input 
                                    className="w-full text-sm border-b border-gray-200 py-1 focus:border-pink-500 outline-none"
                                    placeholder="Opcional"
                                    value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold mt-4 flex justify-center items-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                        >
                            <Save size={18}/> {loading ? 'Guardando...' : 'Crear Pedido'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderModal;