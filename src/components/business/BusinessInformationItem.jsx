import React from 'react';

const BusinessInformationItem = ({ icon: Icon, label, value }) => {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-pink-50/50 transition-colors">
            <div className="p-2.5 bg-pink-100 text-pink-600 rounded-lg shrink-0">
                {Icon && <Icon size={20} strokeWidth={2} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                    {label}
                </p>
                <p className="text-gray-800 font-medium leading-tight break-words whitespace-pre-line">
                    {value || "No especificado"}
                </p>
            </div>
        </div>
    );
};

export default BusinessInformationItem;