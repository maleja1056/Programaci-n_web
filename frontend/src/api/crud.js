// Funciones genéricas para el CRUD de las 5 tablas de la API REST
// (ver la tabla "API REST" del README). Todas usan apiRequest (client.js),
// que envía la cookie de sesión y lanza un ApiError con el mensaje y el código
// HTTP cuando el servidor responde con error (400, 401, 403, 404, 409...).
//
// Uso:
//   import { crearCrud } from "../api/crud.js";
//   const productosApi = crearCrud("productos");
//   const lista = await productosApi.listar({ buscar: "acetaminofén", todos: true });
//   await productosApi.crear({ nombre: "...", precio: 1000 });
//   await productosApi.actualizar(5, { stock: 20 });
//   await productosApi.cancelar(5);                      // desactiva
//   await productosApi.cancelar(5, { definitivo: true }); // borra
//
// En el modo demostración (VITE_MODO_DEMO=true) no hay base de datos: las
// funciones lanzan un ApiError explicando que se necesita el backend.
import { clearCatalogCache } from "./catalog.js";
import { ApiError, apiRequest } from "./client.js";
import { USAR_BACKEND } from "./config.js";

// Ruta de la API de cada tabla
export const RUTAS = {
  categorias: "/api/categorias",
  productos: "/api/productos",
  usuarios: "/api/usuarios",
  pedidos: "/api/pedidos",
  detalle: "/api/detalle-pedidos",
};

// Tablas que cambian lo que muestra la portada: al modificarlas se olvida el
// catálogo guardado en memoria para que la portada y el menú se actualicen.
// Pedidos y detalle también, porque mueven el stock de los productos.
const TABLAS_DEL_CATALOGO = new Set(["categorias", "productos", "pedidos", "detalle"]);

const SIN_BACKEND =
  "Esta función necesita el backend y la base de datos. Desactiva el modo demostración (VITE_MODO_DEMO) para usarla.";

// Convierte { buscar: "abc", todos: true, estado: "" } en "?buscar=abc&todos=true".
// Los valores vacíos, null o undefined no se envían.
export function aQueryString(filtros = {}) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || valor === "") continue;
    params.append(clave, String(valor));
  }
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

function rutaDe(tabla) {
  const ruta = RUTAS[tabla];
  if (!ruta) throw new Error(`Tabla desconocida en crud.js: "${tabla}"`);
  return ruta;
}

// Hace la petición; en el modo demostración responde con un error claro
async function pedir(path, opciones) {
  if (!USAR_BACKEND) throw new ApiError(SIN_BACKEND, 503);
  return apiRequest(path, opciones);
}

// Después de escribir en categorías o productos se limpia la caché del catálogo
async function escribir(tabla, path, opciones) {
  const respuesta = await pedir(path, opciones);
  if (TABLAS_DEL_CATALOGO.has(tabla)) clearCatalogCache();
  return respuesta;
}

// GET /api/<tabla>?filtros → arreglo de filas
export function listar(tabla, filtros) {
  return pedir(`${rutaDe(tabla)}${aQueryString(filtros)}`);
}

// GET /api/<tabla>/:id → una fila
export function obtener(tabla, id) {
  return pedir(`${rutaDe(tabla)}/${encodeURIComponent(id)}`);
}

// POST /api/<tabla> → la fila creada
export function crear(tabla, datos) {
  return escribir(tabla, rutaDe(tabla), { method: "POST", body: datos });
}

// PUT /api/<tabla>/:id → la fila modificada (solo cambian los campos enviados)
export function actualizar(tabla, id, datos) {
  return escribir(tabla, `${rutaDe(tabla)}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: datos,
  });
}

// DELETE /api/<tabla>/:id → { success, message, ... }
// Por defecto cancela (desactiva o pone el pedido en "cancelado");
// con { definitivo: true } borra la fila de la base de datos.
export function cancelar(tabla, id, { definitivo = false } = {}) {
  const query = definitivo ? aQueryString({ definitivo: true }) : "";
  return escribir(tabla, `${rutaDe(tabla)}/${encodeURIComponent(id)}${query}`, {
    method: "DELETE",
  });
}

// Devuelve las 5 funciones ya ligadas a una tabla, para no repetir su nombre
export function crearCrud(tabla) {
  rutaDe(tabla); // falla pronto si el nombre está mal escrito
  return {
    listar: (filtros) => listar(tabla, filtros),
    obtener: (id) => obtener(tabla, id),
    crear: (datos) => crear(tabla, datos),
    actualizar: (id, datos) => actualizar(tabla, id, datos),
    cancelar: (id, opciones) => cancelar(tabla, id, opciones),
  };
}
