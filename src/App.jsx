import React, { useEffect, useState } from 'react';
// IMPORTANTE: useLocation solo funciona dentro de Router, por eso quitamos BrowserRouter de aquí
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// --- IMPORTS DE PÁGINAS ---
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PointOfSalePage from './pages/PointOfSalePage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UsersPage';
import CustomerPage from './pages/CustomerPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BusinessPage from './pages/BusinessPage';
import DiscountPage from './pages/DiscountPage';

// --- IMPORTS DE COMPONENTES ---
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import LoadingScreen from './components/ui/LoadingScreen';
import { businessService } from './services/businessService';

// --- IMPORTS DE SEGURIDAD ---
import { PERMISSIONS } from './constants/permissions';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useToastLimit } from './hooks/useToastLimit';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7031';

// Helper para imágenes
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

// --- LAYOUT INTERNO (DASHBOARD) ---
function AppLayout() {
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
      {/* El Sidebar se mantendrá estático gracias al Key Logic en AppContent */}
      <div className="flex-shrink-0 h-full hidden md:block">
        <Sidebar logoUrl={businessLogo} />
      </div>
      <main className="flex-1 h-full overflow-y-auto relative pb-20 md:pb-0 custom-scrollbar">
        <Outlet />
      </main>
      <BottomNav activeLink="Punto de Venta" />
    </div>
  );
}

// --- CONTENIDO DE LA APP ---
function AppContent() {
  const location = useLocation();
  const { loading } = useAuth();
  const [appLogo, setAppLogo] = useState(null);
  useToastLimit(1);

  // Lógica para el Key de Animación:
  // Solo animamos transiciones entre rutas públicas (Login <-> Forgot <-> Reset).
  // Si estamos dentro del sistema (cualquier otra ruta), usamos una llave fija 
  // para evitar que el Layout/Sidebar se desmonte y parpadee.
  const isPublicRoute = ['/login', '/forgot-password', '/reset-password'].includes(location.pathname);
  const routeKey = isPublicRoute ? location.pathname : 'dashboard-static-context';

  useEffect(() => {
    const loadGlobalLogo = async () => {
      try {
        const data = await businessService.getBusiness();
        if (Array.isArray(data) && data.length > 0) {
          setAppLogo(getImageUrl(data[0].logo || data[0].Logo));
        }
      } catch (e) {
        console.log("Offline o backend no disponible.");
      }
    };
    loadGlobalLogo();
  }, []);

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

      <AnimatePresence mode="wait">
        {loading && (
          <LoadingScreen logoUrl={appLogo} />
        )}
      </AnimatePresence>

      <AnimatePresence mode='wait'>
        {/* APLICAMOS EL ROUTE KEY CALCULADO ARRIBA */}
        <Routes location={location} key={routeKey}>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="business" element={<BusinessPage />} />

              <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.SALES.CREATE} />}>
                <Route path="pos" element={<PointOfSalePage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.SALES.VIEW} />}>
                <Route path="sales-history" element={<SalesHistoryPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.PRODUCTS.VIEW} />}>
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="categories" element={<CategoryPage />} />
                <Route path="discounts" element={<DiscountPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.USERS.VIEW} />}>
                <Route path="users" element={<UsersPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.CLIENTS.VIEW} />}>
                <Route path="customers" element={<CustomerPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

// --- COMPONENTE RAÍZ ---
function App() {
  // Eliminamos BrowserRouter de aquí porque ya está en main.jsx
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;