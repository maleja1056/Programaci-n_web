// Funciones para subir, listar, descargar y borrar archivos (/api/archivos).
// La subida usa XMLHttpRequest en lugar de fetch porque permite mostrar el
// progreso (útil con videos grandes).
//
// En el modo demostración (VITE_MODO_DEMO=true) no hay servidor donde
// guardar los archivos: las funciones responden con un error claro.
import { ApiError, apiRequest, SERVER_UNAVAILABLE } from "./client.js";
import { aQueryString } from "./crud.js";
import { USAR_BACKEND } from "./config.js";

const RUTA = "/api/archivos";

// Igual que en el backend (routes/archivos.js)
export const TAMANO_MAXIMO = 50 * 1024 * 1024;
export const EXTENSIONES = {
  texto: ["txt", "csv", "md", "pdf", "doc", "docx", "odt", "xls", "xlsx", "ods", "ppt", "pptx", "odp", "zip"],
  imagen: ["jpg", "jpeg", "png", "gif", "webp"],
  video: ["mp4", "webm", "mov", "mkv", "avi"],
  audio: ["mp3", "wav", "ogg", "m4a"],
};
// Valor del atributo accept del <input type="file">: ".txt,.csv,..."
export const ACEPTA = Object.values(EXTENSIONES)
  .flat()
  .map((extension) => `.${extension}`)
  .join(",");

const SIN_BACKEND =
  "Subir y bajar archivos necesita el backend. Desactiva el modo demostración (VITE_MODO_DEMO) para usarlo.";

function comprobarBackend() {
  if (!USAR_BACKEND) throw new ApiError(SIN_BACKEND, 503);
}

// GET /api/archivos?buscar=&tipo= → [{ nombre, original, tipo, tamano, subido_en, propio }]
export function listarArchivos(filtros) {
  comprobarBackend();
  return apiRequest(`${RUTA}${aQueryString(filtros)}`);
}

// DELETE /api/archivos/:nombre
export function borrarArchivo(nombre) {
  comprobarBackend();
  return apiRequest(`${RUTA}/${encodeURIComponent(nombre)}`, { method: "DELETE" });
}

// Enlaces para descargar el archivo o verlo en el navegador. Funcionan como
// href normales porque la cookie de sesión va en la petición.
export const urlDescarga = (nombre) => `${RUTA}/${encodeURIComponent(nombre)}`;
export const urlVer = (nombre) => `${urlDescarga(nombre)}?ver=true`;

// POST /api/archivos con el archivo en el campo "archivo".
// alProgresar(porcentaje) se llama mientras se envía (0 a 100).
export function subirArchivo(archivo, alProgresar) {
  comprobarBackend();
  return new Promise((resolve, reject) => {
    const datos = new FormData();
    datos.append("archivo", archivo);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", RUTA);
    xhr.responseType = "json";

    xhr.upload.onprogress = (evento) => {
      if (evento.lengthComputable && alProgresar) {
        alProgresar(Math.round((evento.loaded / evento.total) * 100));
      }
    };

    xhr.onload = () => {
      const respuesta = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300) return resolve(respuesta);
      const mensaje =
        respuesta?.message ||
        (xhr.status >= 500 ? SERVER_UNAVAILABLE : "No se pudo subir el archivo.");
      reject(new ApiError(mensaje, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError(SERVER_UNAVAILABLE, 0));

    xhr.send(datos);
  });
}

// Tamaño legible: 980 B, 12,4 KB, 3,1 MB
export function formatTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const unidades = ["KB", "MB", "GB"];
  let valor = bytes / 1024;
  let i = 0;
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024;
    i += 1;
  }
  return `${valor.toLocaleString("es-CO", { maximumFractionDigits: 1 })} ${unidades[i]}`;
}
