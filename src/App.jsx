// Se importan los componentes de React Router y nuestras páginas.
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PointOfSalePage from './pages/PointOfSalePage';
import InventoryPage from './pages/InventoryPage'; // se importa pagina de inventario
// se importan las paginas faltantes de userpage y supplierspage
import UsersPage from './pages/UserPage'; // Usamos el nombre singular correcto: UserPage
import SuppliersPage from './pages/SuppliersPage';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import logo from './assets/logo.png';


// Se crea un componente de Layout para las páginas protegidas.
// Este layout incluye el Sidebar, BottomNav y el contenido de la página actual.
function AppLayout() {
  // Obtenemos la información del usuario del contexto (si necesitas los datos del usuario logueado, usa 'user').
  // En este contexto, el user debe ser el objeto que obtienes al decodificar el JWT.
  // Si tu AuthContext no tiene 'user', puedes quitar la prop 'user={user}' del Sidebar.
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
      {/* Nota: Deberías hacer BottomNav responsivo para ocultarse en desktop. */}
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
    <Routes>
      {/* Ruta para la página de inicio de sesión. */}
      <Route path="/login" element={<LoginPage logoUrl={logo} />} />

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
        <Route path="users" element={<UsersPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
      </Route>

      {/* Ruta comodín para redirigir cualquier otra URL no encontrada a la página principal (la cual redirige al dashboard). */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Se exporta el componente App.
export default App;