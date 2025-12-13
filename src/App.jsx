import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// --- IMPORTS DE PÁGINAS ---
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PointOfSalePage from './pages/PointOfSalePage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UserPage';
import CustomerPage from './pages/CustomerPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BusinessPage from './pages/BusinessPage';

// --- IMPORTS DE COMPONENTES ---
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import { businessService } from './services/businessService';

// --- IMPORTS DE SEGURIDAD ---
import { PERMISSIONS } from './constants/permissions';
import ProtectedRoute from './components/auth/ProtectedRoute'; // <--- Usamos el componente externo

const API_BASE_URL = 'https://localhost:7031';

const getImageUrl = (rawImage) => {
  if (!rawImage) return null;
  if (!rawImage.includes('/') && rawImage.length > 100) {
    return `data:image/png;base64,${rawImage}`;
  }
  if (rawImage.includes("Uploads") || rawImage.includes("/")) {
    const cleanPath = rawImage.replace(/\\/g, '/');
    const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    return `${API_BASE_URL}/${pathPart}`;
  }
  return rawImage;
};

// --- LAYOUT PRINCIPAL (Sidebar + Contenido) ---
function AppLayout() {
  const { user } = useAuth(); // Sidebar puede usar esto o su propio hook
  const [businessLogo, setBusinessLogo] = useState(null);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const data = await businessService.getBusiness();
        if (Array.isArray(data) && data.length > 0) {
          const business = data[0];
          setBusinessLogo(getImageUrl(business.logo || business.Logo));
        }
      } catch (error) {
        console.error("Error cargando logo:", error);
      }
    };
    fetchBusinessInfo();
  }, []);

  return (
    <div className="flex h-screen w-full bg-pink-50 overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0 h-full hidden md:block">
        <Sidebar logoUrl={businessLogo} />
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto relative pb-20 md:pb-0 custom-scrollbar">
        {/* Aquí se renderizan las páginas hijas (Dashboard, Users, etc.) */}
        <Outlet />
      </main>

      {/* Navegación Móvil */}
      <BottomNav activeLink="Punto de Venta" />
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
          success: {
            style: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 'bold' },
            iconTheme: { primary: '#10B981', secondary: '#ECFDF5' },
          },
          error: {
            style: { background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', fontWeight: 'bold' },
            iconTheme: { primary: '#EC4899', secondary: '#FFF1F2' },
          },
        }}
      />
      
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage logoUrl={null} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* --- RUTAS PROTEGIDAS --- */}
        {/* Nivel 1: Verificar que esté Logueado */}
        <Route element={<ProtectedRoute />}>
          
          {/* Nivel 2: Renderizar el Layout (Sidebar) */}
          <Route element={<AppLayout />}>
            
            {/* Rutas Accesibles para cualquier usuario logueado */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="business" element={<BusinessPage />} />

            {/* --- ZONAS VIP (Con Permisos Específicos) --- */}
            
            {/* Ventas */}
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.SALES.CREATE} />}>
               <Route path="pos" element={<PointOfSalePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.SALES.VIEW} />}>
              <Route path="sales-history" element={<SalesHistoryPage />} />
            </Route>

            {/* Inventario */}
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.PRODUCTS.VIEW} />}>
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="categories" element={<CategoryPage />} />
            </Route>

            {/* Usuarios (Aquí estaba el conflicto) */}
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.USERS.VIEW} />}>
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Clientes */}
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.CLIENTS.VIEW} />}>
              <Route path="customers" element={<CustomerPage />} />
            </Route>

          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;