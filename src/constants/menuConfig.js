import { PERMISSIONS } from './permissions'; // Ajusta la ruta si es necesario
// Importamos los iconos como objetos/funciones, NO como componentes
import {
    LayoutDashboard,
    ShoppingCart,
    History,
    Store,
    Layers,
    Users,
    Package,
    Tags,
    IdCard,
    Percent,
    Building
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
                permission: PERMISSIONS.ORDERS.CREATE
            }
]
    },
{
    title: "Administración",
        icon: Layers,
            permission: null,
                submenu: [
                    {
                        title: "Negocio",
                        path: "/business",
                        icon: Building,
                        permission: PERMISSIONS.USERS.CREATE
                    },
                    {
                        title: "Usuarios",
                        path: "/users",
                        icon: Users,
                        permission: PERMISSIONS.USERS.CREATE
                    },
                    {
                        title: "Clientes",
                        path: "/customers",
                        icon: IdCard,
                        permission: PERMISSIONS.CLIENTS.CREATE
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
                        permission: PERMISSIONS.PRODUCTS.CREATE
                    },
                    {
                        title: "Categorías",
                        path: "/categories",
                        icon: Tags,
                        permission: PERMISSIONS.PRODUCTS.CREATE
                    },
                    {
                        title: 'Descuentos',
                        path: '/discounts',
                        icon: Percent,
                        permission: PERMISSIONS.PRODUCTS.CREATE
                    }
                ]
}
];