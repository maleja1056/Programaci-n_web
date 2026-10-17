// Catálogo local del modo demostración (ver api/config.js).
// Tiene la misma forma que devuelven GET /api/categorias y GET /api/productos,
// así useCatalog.js lo adapta igual que los datos del backend.
// Los seis primeros productos son los de la base de datos del equipo; el 7 y
// el 8 requieren fórmula (para mostrar el popover "Con fórmula") y el 9 está
// agotado (stock 0) para mostrar ese estado.

export const categorias = [
  {
    id: 1,
    nombre: "Medicamentos",
    descripcion: "Medicamentos de venta libre y productos farmacéuticos",
  },
  {
    id: 2,
    nombre: "Cuidado personal",
    descripcion: "Productos para higiene y cuidado personal",
  },
  {
    id: 3,
    nombre: "Vitaminas y suplementos",
    descripcion: "Vitaminas y suplementos nutricionales",
  },
  {
    id: 4,
    nombre: "Primeros auxilios",
    descripcion: "Materiales e insumos para primeros auxilios",
  },
];

// Devuelve el nombre de una categoría a partir de su id (como el JOIN del backend)
const nombreCategoria = (id) =>
  categorias.find((categoria) => categoria.id === id)?.nombre || null;

const crearProducto = (producto) => ({
  ...producto,
  categoria: nombreCategoria(producto.categoria_id),
  imagen_url: null,
});

export const productos = [
  {
    id: 1,
    categoria_id: 1,
    nombre: "Acetaminofén 500 mg",
    descripcion: "Analgésico y antipirético",
    precio: 8500,
    stock: 50,
    requiere_formula: false,
  },
  {
    id: 2,
    categoria_id: 1,
    nombre: "Ibuprofeno 400 mg",
    descripcion: "Antiinflamatorio y analgésico",
    precio: 12000,
    stock: 35,
    requiere_formula: false,
  },
  {
    id: 3,
    categoria_id: 2,
    nombre: "Gel antibacterial",
    descripcion: "Gel para higiene de manos",
    precio: 7500,
    stock: 40,
    requiere_formula: false,
  },
  {
    id: 4,
    categoria_id: 2,
    nombre: "Crema humectante",
    descripcion: "Crema para hidratación de la piel",
    precio: 18000,
    stock: 20,
    requiere_formula: false,
  },
  {
    id: 5,
    categoria_id: 3,
    nombre: "Vitamina C",
    descripcion: "Suplemento de vitamina C",
    precio: 15000,
    stock: 25,
    requiere_formula: false,
  },
  {
    id: 6,
    categoria_id: 4,
    nombre: "Gasas estériles",
    descripcion: "Paquete de gasas para curaciones",
    precio: 6000,
    stock: 60,
    requiere_formula: false,
  },
  {
    id: 7,
    categoria_id: 1,
    nombre: "Amoxicilina 500 mg",
    descripcion: "Antibiótico de amplio espectro",
    precio: 16500,
    stock: 30,
    requiere_formula: true,
  },
  {
    id: 8,
    categoria_id: 1,
    nombre: "Losartán 50 mg",
    descripcion: "Antihipertensivo para el control de la presión arterial",
    precio: 14000,
    stock: 18,
    requiere_formula: true,
  },
  {
    id: 9,
    categoria_id: 4,
    nombre: "Termómetro digital",
    descripcion: "Termómetro de lectura rápida con alarma de fiebre",
    precio: 22000,
    stock: 0,
    requiere_formula: false,
  },
].map(crearProducto);
