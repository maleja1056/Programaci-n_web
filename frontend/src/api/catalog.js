// Obtiene los productos y las categorías del catálogo, sin adaptarlos a la vista.
// Con el backend (USAR_BACKEND) llama a GET /api/productos y GET /api/categorias;
// en el modo demostración usa los datos locales de data/productos.js.
import { USAR_BACKEND } from "./config.js";
import * as demo from "./demo.js";

async function getCatalogBackend() {
  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch("/api/productos"),
    fetch("/api/categorias"),
  ]);

  if (!productsResponse.ok || !categoriesResponse.ok) {
    throw new Error("El servidor no pudo cargar los productos y las categorías.");
  }

  const productos = await productsResponse.json();
  const categorias = await categoriesResponse.json();

  if (!Array.isArray(productos) || !Array.isArray(categorias)) {
    throw new Error("El servidor devolvió una respuesta inesperada.");
  }

  return { productos, categorias };
}

export const getCatalog = USAR_BACKEND ? getCatalogBackend : demo.getCatalog;
