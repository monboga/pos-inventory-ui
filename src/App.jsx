// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion'; // <--- IMPORTANTE

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
import LoadingScreen from './components/ui/LoadingScreen'; // <--- IMPORTANTE
import { businessService } from './services/businessService';

// --- IMPORTS DE SEGURIDAD ---
import { PERMISSIONS } from './constants/permissions';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useToastLimit } from './hooks/useToastLimit';

const API_BASE_URL = 'https://localhost:7031';

// Helper para imágenes (Mantenemos tu lógica)
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

// --- LAYOUT PRINCIPAL ---
function AppLayout() {
  const { user } = useAuth();
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

// --- APP PRINCIPAL ---
function App() {
  useToastLimit(1);
  
  // 1. Obtenemos el estado de carga global
  const { loading } = useAuth(); 
  
  // 2. Estado para el logo del Loader (Global)
  const [appLogo, setAppLogo] = useState(null);

  // 3. Efecto para cargar el logo apenas inicia la App (para el Splash Screen)
  useEffect(() => {
    const loadGlobalLogo = async () => {
        try {
            // Intentamos cargar el logo del negocio para el loader
            const data = await businessService.getBusiness();
            if (Array.isArray(data) && data.length > 0) {
                setAppLogo(getImageUrl(data[0].logo || data[0].Logo));
            }
        } catch (e) {
            
            console.log("Modo offline o Backend no disponible para el logo.");
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

      {/* --- PANTALLA DE CARGA (Overlay) --- */}
      {/* AnimatePresence permite que el componente se anime AL DESMONTARSE (exit) */}
      <AnimatePresence mode="wait">
        {loading && (
            <LoadingScreen logoUrl={appLogo} />
        )}
      </AnimatePresence>

      {/* --- RUTAS --- */}
      <Routes>
        <Route path="/login" element={<LoginPage logoUrl={null} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="business" element={<BusinessPage />} />

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

            {/* Usuarios */}
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.USERS.VIEW} />}>
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Clientes */}
            <Route element={<ProtectedRoute requiredPermission={PERMISSIONS.CLIENTS.VIEW} />}>
              <Route path="customers" element={<CustomerPage />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;