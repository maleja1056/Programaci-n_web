// Carrito de compras. Lo puede usar cualquiera, también el visitante sin
// sesión: el inicio de sesión se pide al confirmar el pedido (CarritoPage).
// - Se guarda en localStorage para no perderlo al recargar o al iniciar
//   sesión a mitad de la compra.
// - Al cerrar sesión se vacía, para que el siguiente usuario del mismo
//   navegador no vea el carrito de otro.
// - Cada producto guarda una copia de su precio y stock; la página del
//   carrito los actualiza con el servidor antes de confirmar
//   (actualizarProductos), y el precio final siempre lo pone el backend.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartContext } from "./cart-context.js";
import { useAuth } from "./auth-context.js";

const CLAVE = "farmauis.carrito";
const MAX_POR_PRODUCTO = 1000; // igual que el backend

function leerGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return []; // navegador sin localStorage o dato dañado
  }
}

// Máximo que se puede pedir de un producto
const tope = (item) => Math.max(0, Math.min(Number(item.stock) || 0, MAX_POR_PRODUCTO));

export function CartProvider({ children }) {
  const { status } = useAuth();
  const [items, setItems] = useState(leerGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // sin localStorage el carrito sigue funcionando hasta recargar
    }
  }, [items]);

  // Vacía el carrito al pasar de "con sesión" a "sin sesión" (cerrar sesión
  // o sesión vencida), no al abrir la página como visitante.
  const estadoAnterior = useRef(status);
  useEffect(() => {
    if (estadoAnterior.current === "authenticated" && status === "anonymous") {
      setItems([]);
    }
    estadoAnterior.current = status;
  }, [status]);

  // producto: { id, nombre, precio, stock, requiereFormula }
  const agregar = useCallback((producto, cantidad = 1) => {
    setItems((actuales) => {
      const existente = actuales.find((item) => item.id === producto.id);
      if (existente) {
        return actuales.map((item) =>
          item.id === producto.id
            ? { ...item, ...producto, cantidad: Math.min(item.cantidad + cantidad, tope(producto)) }
            : item
        );
      }
      return [...actuales, { ...producto, cantidad: Math.min(cantidad, tope(producto)) }];
    });
  }, []);

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((actuales) =>
      actuales.map((item) =>
        item.id === id ? { ...item, cantidad: Math.max(1, Math.min(cantidad, tope(item))) } : item
      )
    );
  }, []);

  const quitar = useCallback((id) => {
    setItems((actuales) => actuales.filter((item) => item.id !== id));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  // Actualiza precio, stock y nombre con los productos que devuelve la API.
  // Los que ya no existen o no tienen stock quedan con disponible = false.
  const actualizarProductos = useCallback((productosApi) => {
    const porId = new Map(productosApi.map((producto) => [producto.id, producto]));
    setItems((actuales) =>
      actuales.map((item) => {
        const producto = porId.get(item.id);
        if (!producto) return { ...item, stock: 0, disponible: false };
        const stock = Number(producto.stock);
        return {
          ...item,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          stock,
          requiereFormula: Boolean(Number(producto.requiere_formula)),
          disponible: stock > 0,
          cantidad: stock > 0 ? Math.min(item.cantidad, Math.min(stock, MAX_POR_PRODUCTO)) : item.cantidad,
        };
      })
    );
  }, []);

  const valor = useMemo(() => {
    const disponibles = items.filter((item) => item.disponible !== false);
    return {
      items,
      unidades: items.reduce((suma, item) => suma + item.cantidad, 0),
      total: disponibles.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      actualizarProductos,
    };
  }, [items, agregar, cambiarCantidad, quitar, vaciar, actualizarProductos]);

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}
