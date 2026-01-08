import { useState } from 'react';

export function useUserModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const openCreateModal = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return {
        isModalOpen,
        currentUser,
        openCreateModal,
        openEditModal,
        closeModal
    };
}