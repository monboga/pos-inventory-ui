import React, { useState } from 'react';
import { User, ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PosClientSelector = ({ clients, selectedClientId, onSelectClient }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Encontrar cliente seleccionado
    const selectedClient = clients.find(c => c.id === selectedClientId);

    // Filtrar lista
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full font-montserrat">
            {/* --- TRIGGER (Lo que se ve siempre) --- */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between bg-white
                    ${isOpen ? 'border-pink-500 ring-2 ring-pink-100' : 'border-gray-200 hover:border-pink-300'}
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Icono Avatar Rosa */}
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
                        <User size={20} strokeWidth={2.5} />
                    </div>
                    
                    {/* Info del Cliente */}
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-gray-800 truncate">
                            {selectedClient ? selectedClient.name : "Seleccionar Cliente"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                            {selectedClient 
                                ? (selectedClient.rfc || `ID: ${selectedClient.id}`) 
                                : "Venta General"}
                        </span>
                    </div>
                </div>

                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* --- DROPDOWN (Lista desplegable) --- */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop invisible para cerrar al dar clic fuera */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                        >
                            {/* Buscador interno */}
                            <div className="p-3 border-b border-gray-50">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar cliente..." 
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-pink-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            {/* Lista */}
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => {
                                                onSelectClient(client.id);
                                                setIsOpen(false);
                                                setSearchTerm("");
                                            }}
                                            className={`
                                                w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors
                                                ${selectedClientId === client.id ? 'bg-pink-50 text-pink-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}
                                            `}
                                        >
                                            <span className="truncate">{client.name}</span>
                                            {selectedClientId === client.id && <Check size={14} />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-gray-400">
                                        No se encontraron clientes.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PosClientSelector;