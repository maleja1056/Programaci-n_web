// Datos y formatos compartidos por la pestaña Pedidos del panel y su modal.
// Los estados y las reglas son los mismos del backend (backend/src/lib/pedidos.js).

// Estados de un pedido, en el orden en que avanza. "clase" es el color de la
// etiqueta (crud-badge en panel.css).
export const ESTADOS_PEDIDO = [
  { valor: "pendiente", texto: "Pendiente", clase: "is-warning" },
  { valor: "confirmado", texto: "Confirmado", clase: "is-info" },
  { valor: "preparando", texto: "Preparando", clase: "is-info" },
  { valor: "enviado", texto: "Enviado", clase: "is-info" },
  { valor: "entregado", texto: "Entregado", clase: "is-on" },
  { valor: "cancelado", texto: "Cancelado", clase: "is-off" },
];

// Estados en los que el administrador todavía puede cambiar los productos
export const ESTADOS_CON_PRODUCTOS_EDITABLES = ["pendiente", "confirmado", "preparando"];

// Máximo de unidades de un producto en una línea (igual que el backend)
export const MAX_CANTIDAD = 1000;

export const estadoDe = (valor) =>
  ESTADOS_PEDIDO.find((estado) => estado.valor === valor) || {
    valor,
    texto: valor,
    clase: "is-off",
  };

// Fecha y hora cortas en español de Colombia, por ejemplo "1 nov 2026, 12:08 a. m."
export const formatFecha = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(fecha)
      )
    : "";
