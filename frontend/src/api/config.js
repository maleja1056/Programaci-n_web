// Interruptor entre el backend real y el modo demostración.
// Por defecto (Fase II) la app usa el backend Express y MySQL a través del
// proxy /api de Vite. Con VITE_MODO_DEMO=true en frontend/.env funciona sola,
// como en la Fase I: login simulado (Admin / 1234) y catálogo local en
// src/data/productos.js.
export const USAR_BACKEND = import.meta.env.VITE_MODO_DEMO !== "true";
