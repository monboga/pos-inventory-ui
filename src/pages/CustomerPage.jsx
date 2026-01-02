import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion'; // 1. Importar animaciones
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import CustomerModal from '../components/customers/CustomerModal';
import toast from 'react-hot-toast';
import { clientService } from '../services/clientService';
import { Search, Plus, Edit, Trash2, Mail, FileText, ShoppingBag, Phone } from 'lucide-react';

// Variantes de animación estándar
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function CustomerPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Aumentado a 10 para aprovechar mejor el espacio

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadClients(); }, []);

    const handleSave = async (formData) => {
        const toastId = toast.loading("Guardando...");
        try {
            if (currentClient) {
                await clientService.update(currentClient.id || currentClient.Id, formData);
                toast.success("Cliente actualizado correctamente", { id: toastId });
            } else {
                await clientService.create(formData);
                toast.success("Cliente creado correctamente", { id: toastId });
            }
            setIsModalOpen(false);
            loadClients();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Eliminar cliente?</h3>
                    <p className="text-sm text-gray-500 mt-1">Se eliminarán sus datos permanentemente.</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => { toast.dismiss(t.id); performDelete(id); }} className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"><span>Eliminar</span></button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    const performDelete = async (id) => {
        try {
            await clientService.delete(id);
            toast.success("Cliente eliminado");
            loadClients();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openCreate = () => { setCurrentClient(null); setIsModalOpen(true); };
    const openEdit = (client) => { setCurrentClient(client); setIsModalOpen(true); };

    const columns = useMemo(() => [
        {
            header: "Cliente",
            render: (row) => {
                const fName = row.firstName || row.FirstName || "";
                const lName = row.lastName || row.LastName || "";
                const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : "Cliente Sin Nombre";
                
                const initial1 = fName ? fName.charAt(0) : "";
                const initial2 = lName ? lName.charAt(0) : "";
                const initials = (initial1 + initial2).toUpperCase() || "C";

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm flex-shrink-0 border-2 border-white shadow-sm">
                            {initials}
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">{fullName}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: #{String(row.id || row.Id).padStart(4, '0')}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Contacto",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                        <Phone size={14} className="text-pink-500" />
                        <span>{row.phoneNumber || row.PhoneNumber || "---"}</span>
                    </div>
                    {(row.email || row.Email) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail size={12} className="text-gray-400" />
                            <span>{row.email || row.Email}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Datos Fiscales",
            render: (row) => {
                const regimenName = row.regimenFiscalDescripcion || row.RegimenFiscalDescripcion || "Sin Régimen";
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                            <FileText size={14} className="text-gray-400" />
                            {row.rfc || row.Rfc || "---"}
                        </div>
                        <span className="text-xs text-gray-500 ml-5 truncate max-w-[150px]" title={regimenName}>
                            {regimenName}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Compras",
            className: "text-center",
            render: (row) => {
                const count = row.salesCount !== undefined ? row.salesCount : (row.SalesCount || 0);
                return (
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            count > 0 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                            <ShoppingBag size={12} /> {count}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(row)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(row.id || row.Id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
            )
        }
    ], []);

    const filtered = clients.filter(c => {
        const term = searchTerm.toLowerCase();
        
        const fName = (c.firstName || c.FirstName || "").toLowerCase();
        const lName = (c.lastName || c.LastName || "").toLowerCase();
        const fullName = `${fName} ${lName}`;
        
        const email = (c.email || c.Email || "").toLowerCase();
        const rfc = (c.rfc || c.Rfc || "").toLowerCase();
        const phone = (c.phoneNumber || c.PhoneNumber || "").toLowerCase();
        
        return fullName.includes(term) || email.includes(term) || rfc.includes(term) || phone.includes(term);
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        // 1. WRAPPER PRINCIPAL
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            
            {/* 2. HEADER FULL WIDTH (Sin padding lateral excesivo) */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestion de Clientes">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, tel, RFC..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                            <Plus size={18} />
                            <span>Nuevo Cliente</span>
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

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                clientToEdit={currentClient}
            />
        </div>
    );
}

export default CustomerPage;