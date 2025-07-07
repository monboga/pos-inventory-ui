// src/App.jsx

import Sidebar from './components/layouts/SideBar';
import logo from './assets/logo.jpeg';

function App() {
  return (
    // 👇 Aquí hacemos el cambio
    <div className="flex bg-rose-50 min-h-screen">
      <Sidebar logoUrl={logo} />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido
        </h1>
        <p className="text-gray-600 mt-2">
          Selecciona una opción del menú para comenzar.
        </p>
      </main>
    </div>
  );
}

export default App;