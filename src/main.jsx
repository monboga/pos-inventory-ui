// src/main.jsx

// Se importan las librerías y componentes necesarios.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Se importa el enrutador.
import { AuthProvider } from './context/AuthContext'; // Se importa el proveedor de autenticación.
import App from './App.jsx';
import './index.css';

// Se renderiza la aplicación en el DOM.
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode ayuda a detectar problemas potenciales en la aplicación.
  <React.StrictMode>
    {/* AuthProvider gestiona el estado de autenticación globalmente. */}
    <AuthProvider>
      {/* BrowserRouter habilita el enrutamiento basado en la URL del navegador. */}
      <BrowserRouter>
        {/* App es el componente principal que contendrá la lógica de las rutas. */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);