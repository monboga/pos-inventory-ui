import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const ProfileInput = ({ label, value, onChange, type = "text", disabled = false, icon: Icon, placeholder, isPassword = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="space-y-1.5 w-full">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <div className="relative">
                {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}

                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-2.5 border rounded-xl outline-none transition-all 
                    ${disabled
                            ? 'bg-gray-50 text-gray-500 border-gray-100 cursor-default'
                            : 'bg-white border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500'
                        }`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfileInput;