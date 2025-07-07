// src/App.jsx

// Se importan los componentes de React Router y nuestras páginas.
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PointOfSalePage from './pages/PointOfSalePage';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import logo from './assets/logo.png';

// --- Componentes Temporales de Marcador de Posición ---
// Se crean componentes simples para que cada ruta muestre algo.
const InventoryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Página de Inventario</h1></div>;
const UsersPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Página de Gestión de Usuarios</h1></div>;
const SuppliersPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Página de Proveedores</h1></div>;

// Se crea un componente de Layout para las páginas protegidas.
// Este layout incluye el Sidebar, BottomNav y el contenido de la página actual.
function AppLayout() {
  // Se obtiene la información del usuario del contexto.
  const { user } = useAuth();
  // El componente retorna la estructura de layout que envuelve las páginas.
  return (
    <div className="flex bg-pink-50 min-h-screen">
      {/* Se renderiza el componente Sidebar, pasando el logo y los datos del usuario. */}
      <Sidebar logoUrl={logo} user={user} />
      {/* '<Outlet />' de React Router renderiza aquí el componente de la ruta hija que coincida. */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {/* Se renderiza la barra de navegación inferior para móviles. */}
      <BottomNav activeLink="Punto de Venta" />
    </div>
  );
}

// Componente para proteger las rutas, asegurando que solo usuarios autenticados puedan acceder.
function ProtectedRoute({ children }) {
  // Se obtiene el usuario del contexto.
  const { user } = useAuth();
  // Si hay un usuario, se renderiza el contenido protegido (children).
  // Si no, se redirige al usuario a la página de inicio de sesión.
  return user ? children : <Navigate to="/login" replace />;
}

// Se define el componente principal de la aplicación que gestiona todas las rutas.
function App() {
  // Retorna el contenedor de rutas.
  return (
    <Routes>
      {/* Ruta para la página de inicio de sesión. */}
      <Route path="/login" element={<LoginPage logoUrl={logo} />} />

      {/* Se crea un grupo de rutas protegidas que comparten el mismo layout. */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Ruta índice (página principal del dashboard). */}
        <Route index element={<DashboardPage />} />
        {/* Nueva ruta para el Punto de Venta. */}
        <Route path="pos" element={<PointOfSalePage />} />
        {/* Se añaden las rutas para los nuevos enlaces del menú. */}
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
      </Route>

      {/* Ruta comodín para redirigir cualquier otra URL no encontrada a la página principal. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Se exporta el componente App.
export default App;