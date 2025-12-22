import { PERMISSIONS } from './permissions'; // Ajusta la ruta si es necesario
// Importamos los iconos como objetos/funciones, NO como componentes
import {
    LayoutDashboard,
    ShoppingCart,
    History,
    Store,
    Settings,
    Briefcase,
    Users,
    Package,
    Tags,
    Percent
} from 'lucide-react';

export const MENU_ITEMS = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard, // SOLO EL NOMBRE, SIN < >
        permission: null
    },
    {
        title: "Ventas",
        icon: ShoppingCart, // SOLO EL NOMBRE
        permission: null,
        submenu: [
            {
                title: "Punto de Venta",
                path: "/pos",
                icon: Store,
                permission: PERMISSIONS.SALES.CREATE
            },
            {
                title: "Historial Ventas",
                path: "/sales-history",
                icon: History,
                permission: PERMISSIONS.SALES.VIEW
            },
            {
                title: "Pedidos",
                path: "/orders",
                icon: ShoppingCart,
                permission: PERMISSIONS.SALES.VIEW
            }
]
    },
{
    title: "Administración",
        icon: Settings,
            permission: null,
                submenu: [
                    {
                        title: "Negocio",
                        path: "/business",
                        icon: Briefcase,
                        permission: PERMISSIONS.USERS.VIEW
                    },
                    {
                        title: "Usuarios",
                        path: "/users",
                        icon: Users,
                        permission: PERMISSIONS.USERS.VIEW
                    },
                    {
                        title: "Clientes",
                        path: "/customers",
                        icon: Users,
                        permission: PERMISSIONS.CLIENTS.VIEW
                    }
                ]
},
{
    title: "Inventario",
        icon: Package,
            permission: null,
                submenu: [
                    {
                        title: "Productos",
                        path: "/inventory",
                        icon: Package,
                        permission: PERMISSIONS.PRODUCTS.VIEW
                    },
                    {
                        title: "Categorías",
                        path: "/categories",
                        icon: Tags,
                        permission: PERMISSIONS.PRODUCTS.VIEW
                    },
                    {
                        title: 'Descuentos',
                        path: '/discounts',
                        icon: Percent
                    }
                ]
}
];