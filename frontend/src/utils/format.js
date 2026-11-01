// Funciones de formato compartidas.

// Precio en pesos colombianos, sin decimales (por ejemplo, $ 8.500)
export const formatPrice = (price) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

// Unidades en inventario como texto ("12 unidades", "1 unidad", "Agotado")
export const formatStock = (stock) => {
  if (!(stock > 0)) return "Agotado";
  return stock === 1 ? "1 unidad" : `${stock} unidades`;
};

// Fecha y hora cortas en español de Colombia, por ejemplo "1/11/2026, 12:08 a. m."
export const formatFecha = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(fecha)
      )
    : "";
