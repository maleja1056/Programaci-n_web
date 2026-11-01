// Mapa de rutas del sitio. Públicas: /, /login y /carrito (el login se pide
// al confirmar el pedido). Privadas: /panel, /perfil, /mis-pedidos y
// /archivos,
// envueltas en ProtectedRoute para que no se puedan abrir escribiendo la URL
// sin haber iniciado sesión. Cualquier otra ruta muestra la página 404.
// Aquí también se cargan las hojas de estilo del proyecto.
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import ArchivosPage from "./pages/ArchivosPage.jsx";
import CarritoPage from "./pages/CarritoPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MisPedidosPage from "./pages/MisPedidosPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PanelPage from "./pages/PanelPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import "./styles/app.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/home.css";
import "./styles/auth.css";
import "./styles/panel.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/carrito" element={<CarritoPage />} />
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <PanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute>
            <MisPedidosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/archivos"
        element={
          <ProtectedRoute>
            <ArchivosPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
