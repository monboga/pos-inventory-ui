import React from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { PASSWORD_RULES } from '../../utils/validators';

function PasswordRequirements({ password }) {

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Requisitos de seguridad</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PASSWORD_RULES.map((rule) => {
                    const isValid = rule.regex.test(password);
                    return (
                        <div key={rule.id} className="flex items-center gap-2 text-sm transition-colors duration-300">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isValid ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                {isValid ? <Check size={12} strokeWidth={3} /> : <XIcon size={12} />}
                            </div>
                            <span className={isValid ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                                {rule.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PasswordRequirements;