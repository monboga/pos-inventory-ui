import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import DynamicTable from '../components/common/DynamicTable';
import CustomerModal from '../components/customers/CustomerModal';
import toast from 'react-hot-toast';
import { clientService } from '../services/clientService';
import { Search, Plus, Edit, Trash2, Mail, FileText, ShoppingBag } from 'lucide-react';

function CustomerPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            console.error(error);
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
            <div className="flex flex-col gap-2">
                <span className="font-medium text-gray-800">
                    ¿Estás seguro de eliminar este cliente?
                </span>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => {
                            toast.dismiss(t.id);
                            performDelete(id); // Llamamos a la función real
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ), { duration: 5000, icon: '⚠️' });
    };

    const openCreate = () => { setCurrentClient(null); setIsModalOpen(true); };
    const openEdit = (client) => { setCurrentClient(client); setIsModalOpen(true); };

    const columns = useMemo(() => [
        {
            header: "Cliente",
            render: (row) => {
                // FIX: Usamos fullName directamente del backend
                const fullName = row.fullName || row.FullName || "Cliente";

                // Generar iniciales
                const initials = fullName
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
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
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-pink-400" />
                    <span>{row.email || row.Email || "Sin correo"}</span>
                </div>
            )
        },
        {
            header: "Datos Fiscales",
            render: (row) => {
                // FIX: Mapeo considerando el posible typo 'Descripion' en el backend (según tu imagen)
                const regimenName = row.regimenFiscalDescripion || row.regimenFiscalDescripcion || row.RegimenFiscalDescripion || "Sin Régimen";

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                            <FileText size={14} className="text-gray-400" />
                            {row.rfc || row.Rfc || "---"}
                        </div>
                        <span className="text-xs text-gray-500 ml-5 truncate max-w-[200px]" title={regimenName}>
                            {regimenName}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Compras",
            className: "text-center",
            render: () => (
                <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                        <ShoppingBag size={12} /> 0
                    </span>
                </div>
            )
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
        // Buscamos sobre fullName que es lo que tenemos
        const fullName = (c.fullName || c.FullName || "").toLowerCase();
        const email = (c.email || c.Email || "").toLowerCase();
        const rfc = (c.rfc || c.Rfc || "").toLowerCase();
        return fullName.includes(term) || email.includes(term) || rfc.includes(term);
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <PageHeader title="Clientes">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo, RFC..."
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