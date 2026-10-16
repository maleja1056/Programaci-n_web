// Integrantes del equipo que aparecen en el pie de página. Al pulsar cada uno
// se abre un modal con sus datos básicos.
//
// PENDIENTE: reemplazar los datos de ejemplo por los reales. Para la foto,
// guardar la imagen en src/assets/img/equipo/, importarla arriba
// (import fotoAna from "../assets/img/equipo/ana.jpg") y ponerla en "foto".
// Sin foto se muestra un círculo con las iniciales.

export const equipo = [
  {
    id: 1,
    nombre: "Integrante 1",
    modulo: "Usuarios, inicio de sesión y navegación",
    codigo: "Por completar",
    programa: "Por completar",
    correo: "Por completar",
    foto: null,
  },
  {
    id: 2,
    nombre: "Integrante 2",
    modulo: "Catálogo, categorías y búsqueda",
    codigo: "Por completar",
    programa: "Por completar",
    correo: "Por completar",
    foto: null,
  },
  {
    id: 3,
    nombre: "Integrante 3",
    modulo: "Detalle de producto y operaciones del catálogo",
    codigo: "Por completar",
    programa: "Por completar",
    correo: "Por completar",
    foto: null,
  },
  {
    id: 4,
    nombre: "Integrante 4",
    modulo: "Diseño adaptable, componentes compartidos e integración",
    codigo: "Por completar",
    programa: "Por completar",
    correo: "Por completar",
    foto: null,
  },
];

// Iniciales para el avatar cuando no hay foto ("Ana Pérez" -> "AP")
export const iniciales = (nombre) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
