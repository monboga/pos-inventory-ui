// src/App.jsx

// Se importan los componentes de React Router y nuestras páginas.
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import logo from './assets/logo.png';

// Se crea un componente para proteger las rutas.
function ProtectedRoute({ children }) {
  // Se obtiene el usuario del contexto.
  const { user } = useAuth();
  // Si no hay usuario, se redirige a la página de login.
  // El prop 'replace' evita que el usuario pueda volver atrás en el historial del navegador.
  return user ? children : <Navigate to="/login" replace />;
}

// Se define el componente principal de la aplicación.
function App() {
  // Retorna el contenedor de rutas.
  return (
    <Routes>
      {/* Ruta para la página de inicio de sesión. */}
      <Route path="/login" element={<LoginPage logoUrl={logo} />} />

      {/* Ruta principal para el dashboard. */}
      {/* Está envuelta en el componente 'ProtectedRoute'. */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage logoUrl={logo} />
          </ProtectedRoute>
        }
      />

      {/* Ruta comodín para redirigir cualquier otra URL a la página principal. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Se exporta el componente App.
export default App;