import React from 'react';
import { X, Save, User, RefreshCw, Mail, Lock, Shield, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSelect from '../common/AnimatedSelect';
import StatusToggle from '../common/StatusToggle';

// Importamos el Hook Nuevo
import { useUserForm } from '../../hooks/users/useUserForm';

// Variantes de animación
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = { 
    hidden: { scale: 0.95, y: 20, opacity: 0 }, 
    visible: { 
        scale: 1, y: 0, opacity: 1, 
        transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } 
    }, 
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } } 
};

function UserModal({ isOpen, onClose, onSubmit, userToEdit }) {
    
    // Invocamos toda la lógica desde el Hook
    const {
        formData,
        handleChange,
        photoPreview,
        fileInputRef,
        triggerFileInput,
        handleFileChange,
        availableRoles,
        loadingRoles,
        isSubmitting,
        error,
        handleSubmit
    } = useUserForm({ isOpen, userToEdit, onSubmit, onClose });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    
                    {/* BACKDROP */}
                    <motion.div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
                        variants={backdropVariants} 
                        initial="hidden" animate="visible" exit="exit" 
                        onClick={onClose} 
                    />

                    {/* MODAL */}
                    <motion.div 
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]" 
                        variants={modalVariants} 
                        initial="hidden" animate="visible" exit="exit"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {userToEdit ? 'Modifica los detalles del usuario existente.' : 'Completa el formulario para registrar un usuario.'}
                                </p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORMULARIO SCROLLABLE */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            
                            {/* ERROR ALERT */}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-start gap-3"
                                >
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div className="text-sm text-red-700">
                                        <p className="font-bold">Error al procesar</p>
                                        <p className="mt-1 opacity-90">{error}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* FOTO UPLOAD (UI Mejorada) */}
                            <div className="flex flex-col items-center gap-2">
                                <div 
                                    className="relative group cursor-pointer w-28 h-28" 
                                    onClick={triggerFileInput}
                                >
                                    {/* Imagen o Placeholder */}
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100 bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-105">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-gray-300" />
                                        )}
                                    </div>

                                    {/* Overlay Hover */}
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                                        <Camera className="text-white drop-shadow-md" size={28} />
                                    </div>
                                    
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">Click para cambiar foto</span>
                            </div>

                            {/* CAMPOS NOMBRE / APELLIDO */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre</label>
                                    <input 
                                        type="text" required 
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-gray-300 text-sm"
                                        placeholder="Ej. Juan"
                                        value={formData.firstName} 
                                        onChange={(e) => handleChange('firstName', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Apellido</label>
                                    <input 
                                        type="text" required 
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-gray-300 text-sm"
                                        placeholder="Ej. Pérez"
                                        value={formData.lastName} 
                                        onChange={(e) => handleChange('lastName', e.target.value)} 
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="email" required 
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 placeholder:text-gray-300 outline-none transition-all text-sm"
                                        placeholder="Ej. john.doe@example.com"
                                        value={formData.email} 
                                        onChange={(e) => handleChange('email', e.target.value)} 
                                    />
                                </div>
                            </div>

                            {/* PASSWORD (Solo en creación) */}
                            {!userToEdit && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="password" required 
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-gray-300 text-sm"
                                            placeholder="••••••••" 
                                            value={formData.password} 
                                            onChange={(e) => handleChange('password', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ROL (Animated Select) */}
                            <div>
                                <AnimatedSelect 
                                    label="Rol de Usuario" 
                                    options={availableRoles} 
                                    value={formData.role} 
                                    onChange={(newVal) => handleChange('role', newVal)} 
                                    icon={Shield} 
                                    placeholder={loadingRoles ? "Cargando roles..." : "Selecciona un rol"} 
                                    disabled={loadingRoles} 
                                />
                            </div>

                            {/* TOGGLE ESTADO (Solo Editar) */}
                            {userToEdit && (
                                <StatusToggle 
                                    isActive={formData.isActive}
                                    onToggle={() => handleChange('isActive', !formData.isActive)}
                                    label="Estado de la cuenta"
                                    description="Al desactivar, el usuario perderá acceso inmediato al sistema."
                                />
                            )}
                        </form>

                        {/* FOOTER */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={isSubmitting} 
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting} 
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-200 transition-all 
                                    ${isSubmitting ? 'bg-pink-300 cursor-wait' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    userToEdit ? <><RefreshCw size={18} /> Actualizar</> : <><Save size={18} /> Guardar</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default UserModal;