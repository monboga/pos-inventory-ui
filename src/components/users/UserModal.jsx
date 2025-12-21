import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, RefreshCw, Mail, Lock, Shield, Camera, AlertCircle } from 'lucide-react'; // Eliminamos ToggleLeft/Right
import { roleService } from '../../services/roleService';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSelect from '../common/AnimatedSelect';
import StatusToggle from '../common/StatusToggle'; // <--- IMPORTAR

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = { hidden: { scale: 0.8, y: 50, opacity: 0 }, visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } }, exit: { scale: 0.9, y: 20, opacity: 0, transition: { duration: 0.15 } } };

function UserModal({ isOpen, onClose, onSubmit, userToEdit }) {
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const [availableRoles, setAvailableRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            if (isOpen) {
                setLoadingRoles(true);
                try {
                    const rolesData = await roleService.getAll();
                    setAvailableRoles(rolesData);
                } catch (err) {
                    console.error("Error cargando roles", err);
                } finally {
                    setLoadingRoles(false);
                }
            }
        };
        fetchRoles();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !loadingRoles) {
            setError(null);
            setPhotoFile(null);

            if (userToEdit) {
                let fName = userToEdit.firstName || userToEdit.FirstName || "";
                let lName = userToEdit.lastName || userToEdit.LastName || "";

                let existingPhoto = "";
                const rawPhoto = userToEdit.photo || userToEdit.Photo;
                if (rawPhoto) {
                    if (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:')) {
                        existingPhoto = rawPhoto;
                    } else {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    }
                }

                let userRoleName = "";
                if (userToEdit.role) {
                    userRoleName = userToEdit.role;
                } else if (userToEdit.roles && userToEdit.roles.length > 0) {
                    userRoleName = userToEdit.roles[0];
                }
                const matchingRoleObj = availableRoles.find(r => (r.name || r.Name) === userRoleName);
                const roleIdToSelect = matchingRoleObj ? (matchingRoleObj.id || matchingRoleObj.Id) : "";

                setFormData({
                    firstName: fName,
                    lastName: lName,
                    email: userToEdit.email || userToEdit.Email || "",
                    password: '', 
                    role: roleIdToSelect,
                    isActive: userToEdit.isActive !== undefined ? userToEdit.isActive : true
                });
                setPhotoPreview(existingPhoto);

            } else {
                let defaultRole = availableRoles.length > 0 ? (availableRoles[0].id || availableRoles[0].Id) : "";
                setFormData({ ...initialFormState, role: defaultRole });
                setPhotoPreview(null);
            }
        }
    }, [isOpen, userToEdit, availableRoles]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await onSubmit({ ...formData, photoFile: photoFile });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm" variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose} />

                    <motion.div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
                        {/* HEADER */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/30">
                            <h2 className="text-xl font-bold text-gray-800">{userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-start gap-3">
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div className="text-sm text-red-700">
                                        <p className="font-bold">Error al guardar</p>
                                        <p className="mt-1">{error}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* FOTO */}
                            <div className="flex justify-center">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-pink-100 shadow-sm bg-white" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-sm text-gray-400"><User size={40} /></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label><input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-gray-300" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label><input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            {!userToEdit && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="password" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-gray-300" placeholder="******" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <AnimatedSelect label="Rol" options={availableRoles} value={formData.role} onChange={(newVal) => setFormData({ ...formData, role: newVal })} icon={Shield} placeholder={loadingRoles ? "Cargando roles..." : "Selecciona un rol"} disabled={loadingRoles} />
                            </div>

                            {/* REFACTOR: USO DE COMPONENTE REUTILIZABLE */}
                            {userToEdit && (
                                <StatusToggle 
                                    isActive={formData.isActive}
                                    onToggle={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    label="Estado de la cuenta"
                                    description="Permitir o bloquear acceso al sistema"
                                />
                            )}

                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-50">
                                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className={`flex items-center gap-2 px-6 py-2 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all ${isSubmitting ? 'bg-pink-300 cursor-wait' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'}`}>
                                    {isSubmitting ? <>Guardando...</> : (userToEdit ? <><RefreshCw size={18} /> Actualizar</> : <><Save size={18} /> Guardar</>)}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default UserModal;