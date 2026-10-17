// Mapa de rutas del sitio. Públicas: / y /login. Privadas: /panel y /perfil,
// envueltas en ProtectedRoute para que no se puedan abrir escribiendo la URL
// sin haber iniciado sesión. Cualquier otra ruta muestra la página 404.
// Aquí también se cargan las hojas de estilo del proyecto.
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PanelPage from "./pages/PanelPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import "./styles/app.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/home.css";
import "./styles/auth.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
