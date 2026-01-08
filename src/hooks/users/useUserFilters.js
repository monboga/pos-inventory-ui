import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';

export function useUserFilters(users) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(null); // null=Todos, true=Activos, false=Inactivos
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- FILTRADO ---
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesStatus = true;
            if (statusFilter === true) matchesStatus = user.isActive === true;
            if (statusFilter === false) matchesStatus = user.isActive === false;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);

    // --- PAGINACIÓN ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // --- GESTIÓN DE VISTAS GUARDADAS ---
    const currentFiltersState = useMemo(() => ({
        searchTerm: searchTerm,
        isActive: statusFilter
    }), [searchTerm, statusFilter]);

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

    return {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        totalPages,
        paginatedUsers: currentUsers,
        currentFiltersState,
        handleApplyView
    };
}