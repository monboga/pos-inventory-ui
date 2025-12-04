import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Mail, Lock, Shield, Camera, ToggleLeft, ToggleRight } from 'lucide-react';
import { roleService } from '../../services/roleService';

// Ajusta este puerto si tu API cambia
const API_BASE_URL = 'https://localhost:7031'; 

function UserModal({ isOpen, onClose, onSubmit, userToEdit }) {
    const fileInputRef = useRef(null);
    
    // Estados
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
    const [photoPreview, setPhotoPreview] = useState(null); // URL para mostrar (Preview)
    const [photoFile, setPhotoFile] = useState(null); // Archivo binario para enviar (Upload)

    // --- FUNCIÓN DE COMPRESIÓN ---
    // Reduce la imagen a 500px y JPG 70% para evitar crash en la API
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
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    // 1. CARGAR ROLES
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

    // 2. RELLENAR DATOS (LOGICA PRINCIPAL)
    useEffect(() => {
        if (isOpen && !loadingRoles) {
            setPhotoFile(null); // Limpiamos archivo pendiente de subida

            if (userToEdit) {
                // --- MODO EDICIÓN ---

                // A. Normalizar Nombres
                let fName = userToEdit.firstName || userToEdit.FirstName || "";
                let lName = userToEdit.lastName || userToEdit.LastName || "";
                const fullName = userToEdit.fullName || userToEdit.FullName || "";
                const email = userToEdit.email || userToEdit.Email || "";

                if ((!fName || !lName) && fullName) {
                    const parts = fullName.trim().split(' ');
                    if (!fName && parts.length > 0) fName = parts[0];
                    if (!lName && parts.length > 1) lName = parts.slice(1).join(' ');
                }
                
                if ((!fName || !lName) && email) {
                    const namePart = email.split('@')[0];
                    const parts = namePart.split(/[._-]/); 
                    if (!fName && parts.length > 0) fName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                    if (!lName && parts.length > 1) lName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                }

                // B. PREVIEW DE FOTO (FIX DE RUTA RELATIVA)
                let existingPhoto = "";
                const rawPhoto = userToEdit.photo || userToEdit.Photo || userToEdit.photoUrl || userToEdit.PhotoUrl;
                
                if (rawPhoto) {
                    // Si es ruta del backend
                    if (rawPhoto.includes("Uploads")) {
                        const cleanPath = rawPhoto.replace(/\\/g, '/');
                        const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                        existingPhoto = `${API_BASE_URL}/${pathPart}`;
                    }
                    else if (rawPhoto.startsWith('data:') || rawPhoto.startsWith('http')) {
                        existingPhoto = rawPhoto;
                    } 
                    else {
                        existingPhoto = `data:image/jpeg;base64,${rawPhoto}`;
                    }
                }

                // C. Encontrar ID del Rol
                const userRoleName = userToEdit.roles && userToEdit.roles.length > 0 ? userToEdit.roles[0] : "";
                const matchingRoleObj = availableRoles.find(r => (r.name || r.Name) === userRoleName);
                const roleIdToSelect = matchingRoleObj ? (matchingRoleObj.id || matchingRoleObj.Id) : "";

                // D. Estado
                const currentStatus = userToEdit.isActive !== undefined ? userToEdit.isActive : true;

                setFormData({
                    firstName: fName,
                    lastName: lName,
                    email: email,
                    password: '',
                    role: roleIdToSelect,
                    isActive: currentStatus
                });
                setPhotoPreview(existingPhoto);

            } else {
                // --- MODO CREAR ---
                let defaultRoleId = "";
                if (availableRoles.length > 0) {
                    defaultRoleId = availableRoles[0].id || availableRoles[0].Id;
                }
                setFormData({ ...initialFormState, role: defaultRoleId, isActive: true });
                setPhotoPreview(null);
            }
        }
    }, [isOpen, userToEdit, availableRoles, loadingRoles]);

    // --- MANEJO DE ARCHIVO ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // 1. Mostrar preview inmediato al usuario
            setPhotoPreview(URL.createObjectURL(file));

            // 2. Comprimir y guardar el archivo optimizado para enviar
            try {
                const compressedFile = await compressImageToFile(file);
                setPhotoFile(compressedFile); 
            } catch (error) {
                console.error("Error comprimiendo", error);
                setPhotoFile(file); // Fallback al original
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let finalRole = formData.role;
        if (!finalRole && availableRoles.length > 0) {
             finalRole = availableRoles[0].id || availableRoles[0].Id;
        }
        
        // Enviamos formData + el archivo 'photoFile'
        onSubmit({ 
            ...formData, 
            role: finalRole,
            photoFile: photoFile 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-pink-50/50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    
                    {/* FOTO */}
                    <div className="flex justify-center mb-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-pink-100 shadow-sm bg-white" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm text-gray-400">
                                    <User size={40} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                            <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {userToEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" required={!userToEdit} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder={userToEdit ? "Sin cambios" : "******"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <div className="relative">
                            <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select 
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white appearance-none"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                disabled={loadingRoles}
                            >
                                {loadingRoles ? (
                                    <option>Cargando roles...</option>
                                ) : availableRoles.map((role) => (
                                    <option key={role.id || role.Id} value={role.id || role.Id}>
                                        {role.name || role.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {userToEdit && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
                            <span className="text-sm font-medium text-gray-700">Estado de la cuenta</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                                    formData.isActive 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                }`}
                            >
                                {formData.isActive ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                            </button>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3 justify-end border-t border-gray-50 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium shadow-sm active:scale-95 transition-all"><Save size={18} /> Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserModal;