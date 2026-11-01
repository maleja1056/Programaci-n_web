// Punto de entrada de React. Carga Bootstrap y los estilos globales (en ese
// orden, para que los ajustes propios ganen) y envuelve la app con:
// BrowserRouter (rutas), AuthProvider (sesión disponible en toda la app) y
// CartProvider (carrito de compras; va dentro de AuthProvider porque se vacía
// al cerrar sesión).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/tokens.css";
import "./styles/bootstrap-overrides.css";
import "./styles/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
