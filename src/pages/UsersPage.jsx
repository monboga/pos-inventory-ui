import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Componentes
import PageHeader from '../components/common/PageHeader';
import UserModal from '../components/users/UserModal';
import DynamicTable from '../components/common/DynamicTable';
import ViewSelector from '../components/common/ViewSelector';

// Hooks (La lógica importada)
import { useUsers } from '../hooks/users/useUsers';
import { useUserFilters } from '../hooks/users/useUserFilters';
import { useUserModal } from '../hooks/users/useUserModal';
import { useUserColumns } from '../hooks/users/useUserColumns';

// Variantes de animación
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function UsersPage() {
    // 1. Hook de Datos (Fetch y CRUD)
    const { users, loading, saveUser, performDelete, loadUsers } = useUsers();

    // 2. Hook de UI del Modal
    const { isModalOpen, currentUser, openCreateModal, openEditModal, closeModal } = useUserModal();

    // 3. Hook de Columnas (Pasamos las acciones)
    const columns = useUserColumns({
        onEdit: openEditModal,
        onDelete: performDelete
    });

    // 4. Hook de Filtros (Recibe los usuarios cargados)
    const {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        totalPages,
        paginatedUsers,
        currentFiltersState,
        handleApplyView
    } = useUserFilters(users);

    // Handler intermedio para guardar y cerrar modal
    const handleSaveSubmit = (formData) => {
        saveUser(formData, currentUser, closeModal);
    };

    return (
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestión de Usuarios">
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
                            
                            {/* Segmented Control */}
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

            {/* CONTENIDO PRINCIPAL */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full">
                    <DynamicTable
                        columns={columns}
                        data={paginatedUsers}
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

            <UserModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onSubmit={handleSaveSubmit} 
                userToEdit={currentUser} 
            />
        </div>
    );
}

export default UsersPage;