// Funciones de formato compartidas.

// Precio en pesos colombianos, sin decimales (por ejemplo, $ 8.500)
export const formatPrice = (price) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
