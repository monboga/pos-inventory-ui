import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Tag, Plus, Edit, Percent } from 'lucide-react';
import { discountService } from '../services/discountService';
import DiscountModal from '../components/discounts/DiscountModal';
import toast from 'react-hot-toast';
import DynamicTable from '../components/common/DynamicTable'; // Asumiendo que usas DynamicTable

function DiscountPage() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    // Configuración de columnas para DynamicTable
    const columns = [
        {
            header: "Motivo",
            render: (row) => <span className="font-medium text-gray-700">{row.reason || row.Reason || "Sin motivo"}</span>
        },
        {
            header: "Porcentaje",
            className: "text-center",
            render: (row) => (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                    <Percent size={12} /> {row.percentage || row.Percentage}%
                </span>
            )
        },
        {
            header: "Estado",
            className: "text-center",
            render: (row) => {
                const active = row.isActive !== undefined ? row.isActive : row.IsActive;
                return active
                    ? <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Activo</span>
                    : <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Inactivo</span>
            }
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (row) => (
                <button onClick={() => { setEditingDiscount(row); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                    <Edit size={18} />
                </button>
            )
        }
    ];

    const loadDiscounts = async () => {
        setLoading(true);
        try {
            const data = await discountService.getAll();
            setDiscounts(data);
        } catch (error) {
            toast.error("Error al cargar descuentos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDiscounts(); }, []);

    const handleSave = async (formData) => {
        try {
            if (editingDiscount) {
                // --- FIX: ID MISMATCH ---
                // Obtenemos el ID seguro
                const id = editingDiscount.id || editingDiscount.Id;

                // Enviamos el ID explícitamente dentro del body 'Id' para que coincida con el comando de C#
                await discountService.update(id, {
                    ...formData,
                    Id: id // <--- ESTO SOLUCIONA EL BAD REQUEST
                });
                toast.success("Descuento actualizado");
            } else {
                await discountService.create(formData);
                toast.success("Descuento creado");
            }
            setIsModalOpen(false);
            loadDiscounts();
        } catch (error) {
            console.error(error);
            // Mostrar mensaje real del backend si existe
            toast.error(error.response?.data?.message || "Error al guardar");
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full p-6 lg:p-8 animate-in fade-in duration-500">
            <PageHeader title="Gestión de Descuentos" icon={Tag}>
                <button onClick={() => { setEditingDiscount(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all">
                    <Plus size={20} /> Nuevo Descuento
                </button>
            </PageHeader>

            <div className="w-full">
                <DynamicTable
                    columns={columns}
                    data={discounts}
                    loading={loading}
                    pagination={{ currentPage: 1, totalPages: 1 }} // Simplificado por ahora
                    onPageChange={() => { }}
                />
            </div>

            <DiscountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                discountToEdit={editingDiscount}
            />
        </div>
    );
}

export default DiscountPage;