// Se importa el componente Sidebar desde su archivo correspondiente.
import Sidebar from './components/layout/Sidebar';
// Se importa la imagen del logo desde la carpeta de activos.
import logo from './assets/logo.png';

// Se define el componente funcional principal 'App'.
function App() {
  // El componente retorna una estructura JSX.
  return (
    // Contenedor principal de la aplicación, habilitado con Flexbox.
    // Se establece un color de fondo rosa muy claro para todo el contenedor.
    <div className="flex bg-pink-50">

      <Sidebar logoUrl={logo} />

      <main className="
        flex-1          // Permite que esta sección ocupe todo el espacio horizontal restante.
        p-10            // Aplica un padding grande para separar el contenido de los bordes.
      ">
        <h1 className="text-2xl font-bold text-gray-800">Contenido Principal</h1>
        <p className="text-gray-700">El contenido de cada página se mostrará aquí.</p>
      </main>

    </div>
  );
}

// Se exporta el componente 'App' para que pueda ser renderizado por 'main.jsx'.
export default App;