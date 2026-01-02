import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

export const useBusinessForm = (businessToEdit, isOpen, onSubmitCallback) => {
    const fileInputRef = useRef(null);
    const [previewLogo, setPreviewLogo] = useState(null);
    
    // Estado inicial seguro (vacío, no undefined)
    const initialFormState = {
        legalName: '', commercialName: '', rfc: '', email: '', phoneNumber: '',
        street: '', externalNumber: '', neighborhood: '', city: '', state: '', 
        country: 'México', postalCode: '',
        regimenFiscalId: '', currencyTypeId: '',
        logo: null
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (businessToEdit) {
                // LECTURA ROBUSTA: Intenta leer camelCase, luego PascalCase, luego string vacío.
                // Esto evita que llegue "undefined" al input o al select.
                setFormData({
                    legalName: businessToEdit.legalName || businessToEdit.LegalName || '',
                    commercialName: businessToEdit.commercialName || businessToEdit.CommercialName || '',
                    rfc: businessToEdit.rfc || businessToEdit.Rfc || '',
                    email: businessToEdit.email || businessToEdit.Email || '',
                    phoneNumber: businessToEdit.phoneNumber || businessToEdit.PhoneNumber || '',
                    
                    street: businessToEdit.street || businessToEdit.Street || businessToEdit.address || businessToEdit.Address || '', // Fallback a Address viejo si existe
                    externalNumber: businessToEdit.externalNumber || businessToEdit.ExternalNumber || '',
                    neighborhood: businessToEdit.neighborhood || businessToEdit.Neighborhood || '',
                    city: businessToEdit.city || businessToEdit.City || '',
                    state: businessToEdit.state || businessToEdit.State || '',
                    country: businessToEdit.country || businessToEdit.Country || 'México',
                    postalCode: businessToEdit.postalCode || businessToEdit.PostalCode || '',
                    
                    // IDs: Convertir a string vacío si es null/undefined para que el Select no falle
                    regimenFiscalId: businessToEdit.regimenFiscalId || businessToEdit.RegimenFiscalId || '',
                    currencyTypeId: businessToEdit.currencyTypeId || businessToEdit.CurrencyTypeId || '',
                    
                    logo: null 
                });

                const serverLogo = businessToEdit.logo || businessToEdit.Logo;
                if (serverLogo) {
                    const logoUrl = serverLogo.includes('http') ? serverLogo : `${API_BASE_URL}/${serverLogo}`;
                    setPreviewLogo(logoUrl);
                } else {
                    setPreviewLogo(null);
                }
            } else {
                setFormData(initialFormState);
                setPreviewLogo(null);
            }
        }
    }, [isOpen, businessToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logo: null }));
        setPreviewLogo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.legalName || !formData.rfc) {
            toast.error("Razón Social y RFC son requeridos");
            return;
        }
        
        // Validación extra para evitar el error 400 del backend
        if (!formData.regimenFiscalId || !formData.currencyTypeId) {
            toast.error("Selecciona Régimen Fiscal y Moneda");
            return;
        }

        const dataToSend = new FormData();
        
        // Mapeo MANUAL explícito para coincidir con tu Command de C#
        dataToSend.append('LegalName', formData.legalName);
        dataToSend.append('CommercialName', formData.commercialName);
        dataToSend.append('Rfc', formData.rfc);
        dataToSend.append('Email', formData.email);
        dataToSend.append('PhoneNumber', formData.phoneNumber);
        
        dataToSend.append('Street', formData.street);
        dataToSend.append('ExternalNumber', formData.externalNumber);
        dataToSend.append('Neighborhood', formData.neighborhood);
        dataToSend.append('City', formData.city);
        dataToSend.append('State', formData.state);
        dataToSend.append('Country', formData.country);
        dataToSend.append('PostalCode', formData.postalCode);

        // Claves importantes: aseguramos que no vayan como "undefined"
        dataToSend.append('RegimenFiscalId', formData.regimenFiscalId);
        dataToSend.append('CurrencyTypeId', formData.currencyTypeId);

        if (formData.logo instanceof File) {
            dataToSend.append('Logo', formData.logo);
        }

        onSubmitCallback(dataToSend);
    };

    return {
        formData, previewLogo, fileInputRef,
        handleChange, handleSelectChange, handleFileChange, handleRemoveLogo, handleSubmit
    };
};