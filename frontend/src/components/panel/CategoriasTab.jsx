// Pestaña "Categorías" del panel de administración (/panel).
// CRUD de la tabla categorias con CrudTable: listar, buscar, crear, editar,
// cancelar (activa = FALSE), reactivar y borrar definitivamente.
// Al borrar una categoría, sus productos quedan "Sin categoría" (la clave
// foránea de productos.categoria_id usa ON DELETE SET NULL).
import { crearCrud } from "../../api/crud.js";
import CrudTable from "./CrudTable.jsx";

// Se crea una sola vez (fuera del componente) para que CrudTable no vuelva a
// pedir la lista en cada render
const api = crearCrud("categorias");

const columnas = [
  {
    clave: "nombre",
    titulo: "Categoría",
    render: (fila) => (
      <>
        <span className="crud-cell-strong">{fila.nombre}</span>
        {fila.descripcion && (
          <span className="crud-cell-sub">{fila.descripcion}</span>
        )}
      </>
    ),
  },
  {
    clave: "productos",
    titulo: "Productos",
    className: "crud-cell-number",
    render: (fila) => Number(fila.productos) || 0,
  },
];

// Mismos límites que el backend (routes/categorias.js)
const campos = [
  {
    nombre: "nombre",
    etiqueta: "Nombre",
    obligatorio: true,
    maxLength: 100,
    placeholder: "Por ejemplo: Cuidado del bebé",
  },
  {
    nombre: "descripcion",
    etiqueta: "Descripción",
    articulo: "la",
    tipo: "textarea",
    maxLength: 255,
    ayuda: "Opcional. Máximo 255 caracteres.",
  },
  {
    nombre: "activa",
    etiqueta: "Activa (visible en la tienda)",
    tipo: "checkbox",
    inicial: true,
  },
];

function CategoriasTab({ alGuardar }) {
  return (
    <CrudTable
      api={api}
      singular="categoría"
      femenino
      columnas={columnas}
      campos={campos}
      campoActivo="activa"
      textoBusqueda="Buscar categoría por nombre o descripción..."
      avisoBorrar="Sus productos no se borran: quedan sin categoría."
      alGuardar={alGuardar}
    />
  );
}

export default CategoriasTab;
