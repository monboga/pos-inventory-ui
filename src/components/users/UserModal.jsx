import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, RefreshCw, Mail, Lock, Shield, Camera, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { roleService } from '../../services/roleService';
import { motion, AnimatePresence } from 'framer-motion'; // 1. Importamos Framer Motion
import AnimatedSelect from '../common/AnimatedSelect'; // Asegúrate de que AnimatedSelect esté disponible

const API_BASE_URL = 'https://localhost:7031';

// Configuraciones de animación
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: {
        scale: 0.9,
        y: 20,
        opacity: 0
    },
    visible: {
        scale: 1,
        y: 0,
        opacity: 1,
        transition: {
            type: "spring", // El efecto rebote
            stiffness: 300,
            damping: 25
        }
    },
    exit: {
        scale: 0.95,
        y: 20,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

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

    // Compresión de imagen (Sin cambios)
    const compressImageToFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }

                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    // --- EFECTOS ---
    useEffect(() => {
        if (isOpen) {
            setError(null);
        }
    }, [isOpen, formData.email]);

    // Cargar Roles
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

    // Rellenar Datos
    useEffect(() => {
        if (isOpen && !loadingRoles) {
            setPhotoFile(null);

            if (userToEdit) {
                let fName = userToEdit.firstName || userToEdit.FirstName || "";
                let lName = userToEdit.lastName || userToEdit.LastName || "";
                const fullName = userToEdit.fullName || userToEdit.FullName || "";
                const email = userToEdit.email || userToEdit.Email || "";

                if ((!fName || !lName) && fullName) {
                    const parts = fullName.trim().split(' ');
                    if (!fName && parts.length > 0) fName = parts[0];
                    if (!lName && parts.length > 1) lName = parts.slice(1).join(' ');
                }

                let existingPhoto = "";
                const rawPhoto = userToEdit.photo || userToEdit.Photo || userToEdit.photoUrl || userToEdit.PhotoUrl;
                if (rawPhoto) {
                    if (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:')) {
                        existingPhoto = rawPhoto;
                    } else {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    }
                }

                const userRoleName = userToEdit.roles && userToEdit.roles.length > 0 ? userToEdit.roles[0] : "";
                const matchingRoleObj = availableRoles.find(r => (r.name || r.Name) === userRoleName);
                const roleIdToSelect = matchingRoleObj ? (matchingRoleObj.id || matchingRoleObj.Id) : "";

                setFormData({
                    firstName: fName,
                    lastName: lName,
                    email: email,
                    password: '',
                    role: roleIdToSelect,
                    isActive: userToEdit.isActive !== undefined ? userToEdit.isActive : true
                });
                setPhotoPreview(existingPhoto);

            } else {
                let defaultRole = availableRoles.length > 0 ? (availableRoles[0].id || availableRoles[0].Id) : "";
                setFormData({ ...initialFormState, role: defaultRole, isActive: true });
                setPhotoPreview(null);
            }
        }
    }, [isOpen, userToEdit, availableRoles, loadingRoles]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            try {
                const compressedFile = await compressImageToFile(file);
                setPhotoFile(compressedFile);
            } catch (error) {
                setPhotoFile(file);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        let selectedRoleId = formData.role;
        if (!selectedRoleId && availableRoles.length > 0) selectedRoleId = availableRoles[0].id || availableRoles[0].Id;

        try {
            onSubmit({
                ...formData,
                role: selectedRoleId,
                photoFile: photoFile
            });
            setIsSubmitting(false);
        } catch (err) {
            console.error("Error al guardar el usuario:", err);
            const message = err.response?.data?.message || err.response?.data || err.message || "Error al guardar el usuario.";
            setError(message);
            setIsSubmitting(false);
        }
    };

    // Usamos AnimatePresence para manejar el montaje/desmontaje con animación
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        variants={modalVariants}
                    // initial, animate, exit se heredan del padre si no se especifican, 
                    // pero aquí los definimos en variants para el efecto de rebote
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORM BODY */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                                    <div className="flex items-center">
                                        <AlertCircle className="text-red-500 mr-2" size={20} />
                                        <p className="text-sm text-red-700 font-bold">Error</p>
                                    </div>
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                </div>
                            )}

                            {/* FOTO */}
                            <div className="flex justify-center">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-pink-100 shadow-sm bg-white"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <div className={`w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm text-gray-400 ${photoPreview ? 'hidden' : 'flex'}`}>
                                        <User size={40} />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Ej. Ana"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Ej. García"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-all placeholder:text-gray-300 ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500'
                                            }`}
                                        placeholder="correo@ejemplo.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* CAMPO DE CONTRASEÑA: Solo visible al crear nuevo usuario */}
                            {!userToEdit && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-gray-300"
                                            placeholder="******"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <AnimatedSelect
                                    label="Rol"
                                    options={availableRoles}
                                    value={formData.role}
                                    onChange={(newVal) => setFormData({ ...formData, role: newVal })}
                                    icon={Shield}
                                    placeholder={loadingRoles ? "Cargando roles..." : "Selecciona un rol"}
                                    disabled={loadingRoles}
                                />
                            </div>

                            {userToEdit && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">Estado de la cuenta</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${formData.isActive
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}
                                    >
                                        {formData.isActive ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                                    </button>
                                </div>
                            )}

                            {/* FOOTER */}
                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-50 mt-4">
                                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-all ${isSubmitting ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>Guardando...</>
                                    ) : (
                                        userToEdit ? <><RefreshCw size={18} /> Actualizar</> : <><Save size={18} /> Guardar</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default UserModal;