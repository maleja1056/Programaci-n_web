// Contexto del carrito de compras y su hook. Está separado de CartContext.jsx
// (que contiene el CartProvider) para que cada archivo exporte una sola cosa,
// igual que auth-context.js.
import { createContext, useContext } from "react";

export const CartContext = createContext(null);

// Devuelve { items, unidades, total, agregar, cambiarCantidad, quitar,
// vaciar, actualizarProductos }. Solo funciona dentro de <CartProvider>.
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }

  return context;
}
