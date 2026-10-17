// Punto de entrada de React. Carga Bootstrap y los estilos globales (en ese
// orden, para que los ajustes propios ganen) y envuelve la app con:
// BrowserRouter (rutas) y AuthProvider (sesión disponible en toda la app).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/bootstrap-overrides.css";
import "./styles/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
