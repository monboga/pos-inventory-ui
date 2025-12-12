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
        ), { duration: 6000, position: 'top-center', style: { background: '#ffffff', color: '#1f2937', padding: '24px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #f3f4f6' }, icon: null });
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
                // --- FIX: Mapeo correcto de FirstName y LastName separados ---
                const fName = row.firstName || row.FirstName || "";
                const lName = row.lastName || row.LastName || "";
                
                // Construimos nombre completo. Si ambos faltan, fallback a "Cliente"
                const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : "Cliente Sin Nombre";

                // Iniciales: Primera letra del nombre + Primera letra del apellido
                const initial1 = fName ? fName.charAt(0) : "";
                const initial2 = lName ? lName.charAt(0) : "";
                const initials = (initial1 + initial2).toUpperCase() || "C";

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

    // --- FIX: Filtro actualizado para buscar en nombre y apellido por separado ---
    const filtered = clients.filter(c => {
        const term = searchTerm.toLowerCase();
        
        const fName = (c.firstName || c.FirstName || "").toLowerCase();
        const lName = (c.lastName || c.LastName || "").toLowerCase();
        const fullName = `${fName} ${lName}`; // Concatenamos para búsqueda flexible
        
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