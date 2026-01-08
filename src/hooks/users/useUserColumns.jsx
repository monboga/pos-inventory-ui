import React, { useMemo } from 'react';
import { Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PermissionGate from '../../components/auth/PermissionGate';
import { PERMISSIONS } from '../../constants/permissions';

export function useUserColumns({ onEdit, onDelete }) {
    
    // Función auxiliar para el Toast de confirmación de eliminación
    const confirmDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">¿Desactivar usuario?</h3>
                    <p className="text-sm text-gray-500 mt-1">El usuario perderá acceso al sistema.</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => { toast.dismiss(t.id); onDelete(id); }} className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-xl hover:bg-pink-600 shadow-sm transition-colors flex items-center gap-2"><span>Desactivar</span></button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

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
                        <button onClick={() => onEdit(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                    </PermissionGate>
                    {user.isActive && (
                        <PermissionGate permission={PERMISSIONS.USERS.DELETE}>
                            <button onClick={() => confirmDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </PermissionGate>
                    )}
                </div>
            )
        }
    ], [onEdit, onDelete]); // Dependencias importantes

    return columns;
}