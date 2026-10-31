// Obtiene los productos y las categorías del catálogo, sin adaptarlos a la vista.
// Con el backend (USAR_BACKEND) llama a GET /api/productos y GET /api/categorias;
// en el modo demostración usa los datos locales de data/productos.js.
// La respuesta se guarda en memoria: la cabecera (submenú de categorías) y la
// portada (catálogo) la piden a la vez y así solo se hace una petición.
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

const loadCatalog = USAR_BACKEND ? getCatalogBackend : demo.getCatalog;

// Petición en curso o ya resuelta, compartida por todos los componentes
let catalogPromise = null;

export function getCatalog() {
  if (!catalogPromise) {
    // Si falla se borra, para que el siguiente intento vuelva a pedirlo
    catalogPromise = loadCatalog().catch((error) => {
      catalogPromise = null;
      throw error;
    });
  }
  return catalogPromise;
}

// Olvida el catálogo guardado (por ejemplo, después de crear o editar un
// producto o una categoría en el panel) para que la próxima carga sea nueva.
export function clearCatalogCache() {
  catalogPromise = null;
}
