import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 1. Animaciones
import { Search, Plus, Edit, Trash2, Shield, Filter } from 'lucide-react';
import {toast, Toaster} from 'react-hot-toast';

// Componentes
import PageHeader from '../components/common/PageHeader';
import UserModal from '../components/users/UserModal';
import DynamicTable from '../components/common/DynamicTable';
import ViewSelector from '../components/common/ViewSelector';
import PermissionGate from '../components/auth/PermissionGate';

// Servicios y Constantes
import { userService } from '../services/userService';
import { PERMISSIONS } from '../constants/permissions';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

// Variantes de animación estándar
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE FILTROS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(null); // null=Todos, true=Activos, false=Inactivos

    // --- PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Aumentado a 10 por defecto para aprovechar espacio

    // --- MODALES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // --- CONFIG VISTAS ---
    const currentFiltersState = useMemo(() => ({
        searchTerm: searchTerm,
        isActive: statusFilter
    }), [searchTerm, statusFilter]);

    // --- NORMALIZACIÓN ---
    const normalizeUser = (rawUser) => {
        let fName = rawUser.firstName || rawUser.FirstName || "";
        let lName = rawUser.lastName || rawUser.LastName || "";
        const fullNameFromApi = rawUser.fullName || rawUser.FullName || "";
        const email = rawUser.email || rawUser.Email || "";

        if ((!fName || !lName) && fullNameFromApi) {
            const parts = fullNameFromApi.trim().split(' ');
            if (!fName && parts.length > 0) fName = parts[0];
            if (!lName && parts.length > 1) lName = parts.slice(1).join(' ');
        }

        let normalizedPhoto = "";
        const rawPhoto = rawUser.photo || rawUser.Photo || rawUser.photoUrl || rawUser.PhotoUrl;

        if (rawPhoto) {
            if (rawPhoto.includes("Uploads")) {
                const cleanPath = rawPhoto.replace(/\\/g, '/');
                const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                normalizedPhoto = `${API_BASE_URL}/${pathPart}`;
            } else if (rawPhoto.startsWith('data:') || rawPhoto.startsWith('http')) {
                normalizedPhoto = rawPhoto;
            } else {
                normalizedPhoto = `data:image/jpeg;base64,${rawPhoto}`;
            }
        }

        return {
            id: rawUser.id || rawUser.Id,
            firstName: fName,
            lastName: lName,
            email: email,
            photo: normalizedPhoto,
            roles: rawUser.roles || rawUser.Roles || ["Usuario"],
            isActive: rawUser.isActive !== undefined ? rawUser.isActive : rawUser.IsActive
        };
    };

    // --- CARGA ---
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            const cleanData = data.map(normalizeUser);
            setUsers(cleanData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    // --- HANDLERS ---
    const handleApplyView = (savedConfig) => {
        if (!savedConfig) {
            setSearchTerm("");
            setStatusFilter(null);
            toast.success("Vista predeterminada aplicada");
            return;
        }
        if (savedConfig.searchTerm !== undefined) setSearchTerm(savedConfig.searchTerm);
        if (savedConfig.isActive !== undefined) setStatusFilter(savedConfig.isActive);
        else setStatusFilter(null);
        setCurrentPage(1);
        toast.success("Vista personalizada cargada");
    };

    const handleSaveUser = async (formData) => {
        const toastId = toast.loading("Guardando usuario...");
        try {
            if (currentUser) {
                await userService.update(currentUser.id, formData);
                toast.success("Usuario actualizado", { id: toastId });
            } else {
                await userService.create(formData);
                toast.success("Usuario creado", { id: toastId });
            }
            setIsModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const performDelete = async (id) => {
        const toastId = toast.loading("Procesando...");
        try {
            await userService.delete(id);
            toast.success("Usuario procesado", { id: toastId });
            loadUsers();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Desactivar usuario?</h3>
                    <p className="text-sm text-gray-500 mt-1">El usuario perderá acceso al sistema.</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => { toast.dismiss(t.id); performDelete(id); }} className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"><span>Desactivar</span></button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    const openCreateModal = () => { setCurrentUser(null); setIsModalOpen(true); };
    const openEditModal = (user) => { setCurrentUser(user); setIsModalOpen(true); };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: "Usuario",
            render: (user) => {
                let initials = "U";
                if (user.firstName) {
                    initials = user.firstName.charAt(0).toUpperCase();
                    if (user.lastName) initials += user.lastName.charAt(0).toUpperCase();
                }

                return (
                    <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0">
                            {user.photo ? (
                                <img src={user.photo} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shadow-sm">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Rol",
            render: (user) => (
                <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 w-fit px-2.5 py-1 rounded-full border border-gray-200">
                    <Shield size={12} className="mr-1.5 text-gray-400" />
                    {user.roles?.[0] || "Usuario"}
                </div>
            )
        },
        {
            header: "Estado",
            className: "text-center",
            render: (user) => (
                user.isActive ?
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide">Activo</span> :
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">Inactivo</span>
            )
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (user) => (
                <div className="flex items-center justify-end gap-1">
                    <PermissionGate permission={PERMISSIONS.USERS.EDIT}>
                        <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                    </PermissionGate>
                    {user.isActive && (
                        <PermissionGate permission={PERMISSIONS.USERS.DELETE}>
                            <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </PermissionGate>
                    )}
                </div>
            )
        }
    ], []);

    // --- FILTRADO ---
    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;
        if (statusFilter === true) matchesStatus = user.isActive === true;
        if (statusFilter === false) matchesStatus = user.isActive === false;
        return matchesSearch && matchesStatus;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        // 1. WRAPPER PRINCIPAL
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            <Toaster position="top-right" />

            {/* 2. HEADER FULL WIDTH */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestión de Usuarios">
                    {/* CONTROLES INTEGRADOS EN EL HEADER */}
                    <div className="flex flex-col xl:flex-row gap-4 items-center w-full xl:w-auto mt-4 xl:mt-0">
                        
                        {/* Grupo Izquierda: Búsqueda y Vistas */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                            
                            <div className="w-full sm:w-auto">
                                <ViewSelector
                                    entityName="Users"
                                    currentFilters={currentFiltersState}
                                    onApplyView={handleApplyView}
                                />
                            </div>
                        </div>

                        {/* Grupo Derecha: Filtros Estado y Acción */}
                        <div className="flex flex-row gap-3 w-full xl:w-auto items-center justify-between xl:justify-start">
                            
                            {/* Segmented Control para Estado */}
                            <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                                <button
                                    onClick={() => setStatusFilter(null)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === null ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setStatusFilter(true)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === true ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-green-600'}`}
                                >
                                    Activos
                                </button>
                                <button
                                    onClick={() => setStatusFilter(false)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === false ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-red-600'}`}
                                >
                                    Inactivos
                                </button>
                            </div>

                            {/* Botón Principal */}
                            <button 
                                onClick={openCreateModal} 
                                className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pink-200 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Nuevo Usuario</span>
                            </button>
                        </div>
                    </div>
                </PageHeader>
            </div>

            {/* 3. CONTENIDO PRINCIPAL */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full">
                    <DynamicTable
                        columns={columns}
                        data={currentUsers}
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

            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveUser} userToEdit={currentUser} />
        </div>
    );
}

export default UsersPage;