import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import UserModal from '../components/users/UserModal';
import DynamicTable from '../components/common/DynamicTable';
import { userService } from '../services/userService';
import { Search, Plus, Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast'; // <--- IMPORTANTE

// URL BASE DE TU API (Ajusta si cambia el puerto)
const API_BASE_URL = 'https://localhost:7031'; 

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    

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
            } 
            else if (rawPhoto.startsWith('data:') || rawPhoto.startsWith('http')) {
                normalizedPhoto = rawPhoto;
            }
            else {
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

    // --- FIX TOAST: Guardar/Editar ---
    const handleSaveUser = async (formData) => {
        const toastId = toast.loading("Guardando usuario...");
        try {
            if (currentUser) {
                await userService.update(currentUser.id, formData);
                toast.success("Usuario actualizado correctamente", { id: toastId });
            } else {
                await userService.create(formData);
                toast.success("Usuario creado correctamente", { id: toastId });
            }
            setIsModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    // --- FIX TOAST: Eliminar (Confirmación Interactiva) ---
   // --- NUEVO TOAST: Estilo Modal Blanco y Rosa (Usuarios) ---
    // Se cierra automáticamente en 6 segundos
    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                {/* Encabezado limpio */}
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Desactivar usuario?</h3>
                    <p className="text-sm text-gray-500 mt-1">El usuario perderá acceso al sistema.</p>
                </div>
                
                {/* Botones alineados a la derecha */}
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => toast.dismiss(t.id)} 
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    
                    {/* Botón ROSA (bg-pink-500) */}
                    <button 
                        onClick={() => { toast.dismiss(t.id); performDelete(id); }} 
                        className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span>Desactivar</span>
                    </button>
                </div>
            </div>
        ), { 
            duration: 6000, // <--- AQUÍ ESTÁ EL CAMBIO (6 SEGUNDOS)
            position: 'top-center', 
            style: {
                background: '#ffffff', // Fondo BLANCO
                color: '#1f2937',      // Texto oscuro
                padding: '24px',
                borderRadius: '16px',  // Bordes redondeados estilo modal
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Sombra fuerte
                border: '1px solid #f3f4f6'
            },
            icon: null 
        });
    };

    const openCreateModal = () => { setCurrentUser(null); setIsModalOpen(true); };
    const openEditModal = (user) => { setCurrentUser(user); setIsModalOpen(true); };

    const columns = useMemo(() => [
        {
            header: "Usuario",
            render: (user) => {
                const fName = user.firstName;
                const lName = user.lastName;
                const hasName = Boolean(fName || lName);

                let initials = "U";
                if (fName) {
                    initials = fName.charAt(0).toUpperCase();
                    if (lName) initials += lName.charAt(0).toUpperCase();
                } else if (user.email) {
                    const namePart = user.email.split('@')[0];
                    if (namePart.includes('-') || namePart.includes('.')) {
                         const parts = namePart.split(/[-.]/);
                         initials = (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
                    } else {
                         initials = namePart.substring(0, 2).toUpperCase();
                    }
                }

                let avatarContent;
                if (user.photo) {
                    avatarContent = <img src={user.photo} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />;
                } else {
                    avatarContent = (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                            {initials}
                        </div>
                    );
                }

                return (
                    <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0">
                            {avatarContent}
                        </div>
                        <div>
                            {hasName ? (
                                <>
                                    <div className="font-bold text-gray-800">{fName} {lName}</div>
                                    <div className="text-xs text-gray-400">{user.email}</div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500 font-medium">{user.email}</div>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Rol",
            render: (user) => {
                const role = user.roles ? user.roles[0] : "Usuario";
                return (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-200">
                        <Shield size={14} className="mr-2 text-gray-400" />
                        {role}
                    </div>
                );
            }
        },
        {
            header: "Estado",
            className: "text-center",
            render: (user) => (
                user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Activo</span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Inactivo</span>
                )
            )
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (user) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                    {user.isActive && (
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Desactivar"><Trash2 size={18} /></button>
                    )}
                </div>
            )
        }
    ], []);

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || 
               user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <PageHeader title="Gestión de Usuarios">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Buscar usuario..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <button onClick={openCreateModal} className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"><Plus size={18} /><span>Nuevo Usuario</span></button>
                </div>
            </PageHeader>

            <div className="w-full">
                <DynamicTable 
                    columns={columns} 
                    data={currentUsers} 
                    loading={loading} 
                    pagination={{ currentPage, totalPages }} 
                    onPageChange={setCurrentPage}
                    
                    // --- NUEVAS PROPS ---
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1); // Reset a pág 1 al cambiar límite
                    }}
                />
            </div>

            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveUser} userToEdit={currentUser} />
        </div>
    );
}

export default UsersPage;