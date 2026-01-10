import React from 'react';
import PersonalTab from './PersonalTab';
import SecurityTab from './SecurityTab';

function ProfileContent({ 
    activeTab, 
    formData, 
    setFormData, 
    passData, 
    setPassData, 
    onUpdateProfile, 
    onChangePassword, 
    isLoading 
}) {
    return (
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px] w-full transition-all hover:shadow-md relative">
            
            {activeTab === 'personal' && (
                <PersonalTab 
                    formData={formData}
                    setFormData={setFormData}
                    onUpdateProfile={onUpdateProfile}
                    isLoading={isLoading}
                />
            )}

            {activeTab === 'security' && (
                <SecurityTab 
                    passData={passData}
                    setPassData={setPassData}
                    onChangePassword={onChangePassword}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

export default ProfileContent;