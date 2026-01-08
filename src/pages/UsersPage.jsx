import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Componentes
import PageHeader from '../components/common/PageHeader';
import UserModal from '../components/users/UserModal';
import DynamicTable from '../components/common/DynamicTable';
import UserToolbar from '../components/users/UserToolbar';

// Hooks
import { useUsers } from '../hooks/users/useUsers';
import { useUserFilters } from '../hooks/users/useUserFilters';
import { useUserModal } from '../hooks/users/useUserModal';
import { useUserColumns } from '../hooks/users/useUserColumns';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function UsersPage() {
    const { users, loading, saveUser, performDelete } = useUsers();
    const { isModalOpen, currentUser, openCreateModal, openEditModal, closeModal } = useUserModal();
    
    const columns = useUserColumns({
        onEdit: openEditModal,
        onDelete: performDelete
    });

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

    const handleSaveSubmit = (formData) => {
        saveUser(formData, currentUser, closeModal);
    };

    return (
        <div className="w-full min-h-screen bg-[#F9FAFB] font-montserrat overflow-x-hidden flex flex-col">
            <Toaster position="top-right" />

            {/* HEADER SIMPLIFICADO */}
            <div className="flex-shrink-0">
                <PageHeader title="Gestión de Usuarios" />
                {/* Nota: Hemos quitado los controles de aquí porque ahora viven en el Toolbar abajo */}
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <motion.div 
                className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* 1. TOOLBAR (Filtros, Busqueda, Acciones) */}
                <UserToolbar 
                    searchTerm={searchTerm}
                    onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                    statusFilter={statusFilter}
                    onStatusChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                    currentFiltersState={currentFiltersState}
                    onApplyView={handleApplyView}
                    onCreateClick={openCreateModal}
                />

                {/* 2. TABLA */}
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