// Interruptor entre el modo demostración y el backend real.
// Sin definir VITE_USAR_BACKEND (o con cualquier valor distinto de "true") la
// app funciona sola: login simulado (Admin / 1234) y catálogo local en
// src/data/productos.js. Con VITE_USAR_BACKEND=true en frontend/.env usa el
// backend Express y MySQL a través del proxy /api de Vite.
export const USAR_BACKEND = import.meta.env.VITE_USAR_BACKEND === "true";
