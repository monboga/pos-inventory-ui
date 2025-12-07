import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PointOfSalePage from './pages/PointOfSalePage';
import InventoryPage from './pages/InventoryPage'; // se importa pagina de inventario
import UsersPage from './pages/UserPage'; // Usamos el nombre singular correcto: UserPage
import CustomerPage from './pages/CustomerPage'; // (Antes SuppliersPage)
import SalesHistoryPage from './pages/SalesHistoryPage'; // Nueva página
import CategoryPage from './pages/CategoryPage'; // Nueva página de categorías
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BusinessPage from './pages/BusinessPage'; // Nueva página de negocio
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import { Toaster } from 'react-hot-toast';
import { businessService } from './services/businessService';

const API_BASE_URL = 'https://localhost:7031';

const getImageUrl = (rawImage) => {
  if (!rawImage) return null;

  // Caso 1: Es Base64 puro (sin prefijo) -> Lo convertimos a Data URI
  // (Detectamos si es un string largo sin espacios y caracteres base64)
  if (!rawImage.includes('/') && rawImage.length > 100) {
    return `data:image/png;base64,${rawImage}`;
  }

  // Caso 2: Es una ruta de archivo del servidor (ej. "Uploads\Logo\img.png")
  if (rawImage.includes("Uploads") || rawImage.includes("/")) {
    const cleanPath = rawImage.replace(/\\/g, '/'); // Reemplazar \ por /
    const pathPart = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    return `${API_BASE_URL}/${pathPart}`; // https://localhost:7031/Uploads/...
  }

  // Caso 3: Ya es una URL completa o Data URI válida
  return rawImage;
};


// Se crea un componente de Layout para las páginas protegidas.
// Este layout incluye el Sidebar, BottomNav y el contenido de la página actual.
function AppLayout() {
  // Obtenemos la información del usuario del contexto (si necesitas los datos del usuario logueado, usa 'user').
  // En este contexto, el user debe ser el objeto que obtienes al decodificar el JWT.
  // Si tu AuthContext no tiene 'user', puedes quitar la prop 'user={user}' del Sidebar.
  const { user } = useAuth();
  const [businessLogo, setBusinessLogo] = useState(null);

  // Efecto para cargar la info del negocio (Logo) al entrar al sistema
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const data = await businessService.getBusiness();
        if (Array.isArray(data) && data.length > 0) {
          const business = data[0];
          // Obtenemos la URL procesada
          const logoSrc = getImageUrl(business.logo || business.Logo);
          setBusinessLogo(logoSrc);
        }
      } catch (error) {
        console.error("Error cargando logo:", error);
      }
    };
    fetchBusinessInfo();
  }, []); // Se ejecuta 1 vez al montar

  // El componente retorna la estructura de layout que envuelve las páginas.
  return (
    <div className="flex h-screen w-full bg-pink-50 overflow-hidden">

      {/* Sidebar con Logo Dinámico */}
      <div className="flex-shrink-0 h-full hidden md:block">
        {/* Pasamos el logo recuperado del backend */}
        <Sidebar logoUrl={businessLogo} user={user} />
      </div>

      <main className="flex-1 h-full overflow-y-auto relative pb-20 md:pb-0 custom-scrollbar">
        <Outlet />
      </main>

      <BottomNav activeLink="Punto de Venta" />
    </div>
  );
}

// Componente para proteger las rutas, asegurando que solo usuarios autenticados puedan acceder.
// MODIFICADO: Usa isAuthenticated y loading para el flujo JWT.
function ProtectedRoute({ children }) {
  // Se obtiene el estado de autenticación (JWT) y el estado de carga.
  const { user, loading } = useAuth();

  if (loading) {
    // Pantalla de carga mientras se verifica el token
    return <div className="flex justify-center items-center h-screen text-gray-600">Verificando sesión...</div>;
  }

  // Si está autenticado, se renderiza el contenido protegido (children).
  if (user) {
    return children;
  }

  // Si no, se redirige al usuario a la página de inicio de sesión.
  return <Navigate to="/login" replace />;
}

// Se define el componente principal de la aplicación que gestiona todas las rutas.
function App() {
  // Retorna el contenedor de rutas.
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Estilos por defecto
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          // Estilo específico para Éxito
          success: {
            style: {
              background: '#ECFDF5', // Verde muy claro
              color: '#065F46',      // Verde oscuro
              border: '1px solid #A7F3D0',
              fontWeight: 'bold',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#ECFDF5',
            },
          },
          // Estilo específico para Error
          error: {
            style: {
              background: '#FFF1F2', // Rosa muy claro (casi rojo)
              color: '#BE123C',      // Rojo/Rosa oscuro
              border: '1px solid #FECDD3',
              fontWeight: 'bold',
            },
            iconTheme: {
              primary: '#EC4899', // Tu color Pink 500
              secondary: '#FFF1F2',
            },
          },
        }}
      />
      <Routes>
        {/* Ruta para la página de inicio de sesión. */}
        <Route path="/login" element={<LoginPage logoUrl={null} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Se crea un grupo de rutas protegidas que comparten el mismo layout. */}
        <Route
          path="/"
          element={
            // Envuelve el AppLayout en ProtectedRoute
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
          <Route path="categories" element={<CategoryPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="sales-history" element={<SalesHistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="business" element={<BusinessPage />} />
        </Route>

        {/* Ruta comodín para redirigir cualquier otra URL no encontrada a la página principal (la cual redirige al dashboard). */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>

  );
}

// Se exporta el componente App.
export default App;