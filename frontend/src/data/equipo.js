// Integrantes del equipo que aparecen en el pie de página. Al pulsar cada uno
// se abre un modal con sus datos básicos (foto, nombre, rol y programa).
//
// Campos de cada integrante:
//   nombre       nombre completo (también genera las iniciales del avatar)
//   rol          rol en el proyecto (se muestra en el footer y en el modal)
//   programa     programa académico
//   archivoFoto  nombre del archivo de la foto SIN la extensión
//
// CÓMO AGREGAR O CAMBIAR UNA FOTO (no hay que tocar el código):
//   1. Guardar la imagen en src/assets/img/equipo/ (.jpg, .jpeg, .png o .webp)
//      con el mismo nombre que "archivoFoto". Ejemplo: para
//      archivoFoto: "maria-fajardo" el archivo es maria-fajardo.jpg
//   2. Foto cuadrada (por ejemplo 400 x 400 px) y de menos de 300 KB.
//   3. Con el servidor en marcha (npm run dev) la foto aparece sola; si ya
//      no estaba cargada, se recarga la página.
// Sin archivo se muestra un círculo con las iniciales.

// Vite carga todas las imágenes de la carpeta (si está vacía, queda {}).
// Cada clave es la ruta del archivo y cada valor, su URL ya resuelta.
const fotos = import.meta.glob("../assets/img/equipo/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

// Busca la foto cuyo nombre (sin extensión) coincide con archivoFoto
const buscarFoto = (archivoFoto) => {
  const ruta = Object.keys(fotos).find((r) =>
    r.replace(/^.*\//, "").replace(/\.[^.]+$/, "") === archivoFoto
  );
  return ruta ? fotos[ruta] : null;
};

const integrantes = [
  {
    id: 1,
    nombre: "María Alejandra Fajardo Fajardo",
    rol: "Scrum Master",
    programa: "Ingeniería de Sistemas",
    archivoFoto: "maria-fajardo",
  },
  {
    id: 2,
    nombre: "Sebastián Andrés Gómez Argüello",
    rol: "Development Team: Frontend",
    programa: "Ingeniería de Sistemas",
    archivoFoto: "sebastian-gomez",
  },
  {
    id: 3,
    nombre: "Juan José Parra Viviescas",
    rol: "Product Owner",
    programa: "Ingeniería de Sistemas",
    archivoFoto: "juan-parra",
  },
  {
    id: 4,
    nombre: "Juan Diego Rodríguez Uribe",
    rol: "Development Team: Backend y base de datos",
    programa: "Ingeniería de Sistemas",
    archivoFoto: "juan-rodriguez",
  },
];

// Lista final que usan el footer y el modal: cada integrante con su "foto"
// (URL de la imagen, o null si todavía no se guardó el archivo)
export const equipo = integrantes.map((integrante) => ({
  ...integrante,
  foto: buscarFoto(integrante.archivoFoto),
}));

// Iniciales para el avatar cuando no hay foto ("Ana Pérez" -> "AP")
export const iniciales = (nombre) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
