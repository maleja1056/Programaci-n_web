// Pestaña "Productos" del panel de administración (/panel).
// CRUD de la tabla productos con CrudTable: listar, buscar (nombre o
// descripción), filtrar por categoría, crear, editar, cancelar
// (activo = FALSE), reactivar y borrar definitivamente.
// Las categorías se cargan aparte para la lista desplegable del formulario y
// para el filtro. Al guardar, crud.js limpia la caché del catálogo, así que
// la portada muestra los cambios.
import { useEffect, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import { crearCrud } from "../../api/crud.js";
import { useAuth } from "../../context/auth-context.js";
import { formatPrice } from "../../utils/format.js";
import CrudTable from "./CrudTable.jsx";

// Se crean una sola vez (fuera del componente) para que CrudTable no vuelva a
// pedir la lista en cada render
const api = crearCrud("productos");
const categoriasApi = crearCrud("categorias");

// Por debajo de este stock el número se resalta como "stock bajo"
const STOCK_BAJO = 5;

const columnas = [
  {
    clave: "nombre",
    titulo: "Producto",
    render: (fila) => (
      <>
        <span className="crud-cell-strong">{fila.nombre}</span>
        <span className="crud-cell-sub">
          {fila.categoria || "Sin categoría"}
          {Number(fila.requiere_formula) ? " · Requiere fórmula médica" : ""}
        </span>
      </>
    ),
  },
  {
    clave: "precio",
    titulo: "Precio",
    className: "crud-cell-number",
    render: (fila) => formatPrice(Number(fila.precio)),
  },
  {
    clave: "stock",
    titulo: "Stock",
    className: "crud-cell-number",
    render: (fila) => {
      const stock = Number(fila.stock);
      if (stock === 0) return <span className="crud-badge is-danger">Agotado</span>;
      if (stock <= STOCK_BAJO)
        return <span className="crud-badge is-warning">{stock} · bajo</span>;
      return stock;
    },
  },
];

// Campos del formulario. Mismos límites que el backend (routes/productos.js).
// La lista de categorías llega del servidor, por eso es una función.
const crearCampos = (categorias) => [
  {
    nombre: "nombre",
    etiqueta: "Nombre",
    obligatorio: true,
    maxLength: 150,
    placeholder: "Por ejemplo: Acetaminofén 500 mg",
  },
  {
    nombre: "categoria_id",
    etiqueta: "Categoría",
    articulo: "la",
    tipo: "select",
    numerico: true,
    placeholder: "Sin categoría",
    opciones: categorias.map((categoria) => ({
      valor: String(categoria.id),
      texto: Number(categoria.activa)
        ? categoria.nombre
        : `${categoria.nombre} (cancelada)`,
    })),
  },
  {
    nombre: "precio",
    etiqueta: "Precio (COP)",
    tipo: "numero",
    obligatorio: true,
    min: 0,
    max: 9999999999,
    step: 50,
    ancho: "medio",
    placeholder: "8500",
  },
  {
    nombre: "stock",
    etiqueta: "Stock (unidades)",
    tipo: "numero",
    obligatorio: true,
    entero: true,
    min: 0,
    max: 1000000,
    step: 1,
    inicial: "0",
    ancho: "medio",
  },
  {
    nombre: "descripcion",
    etiqueta: "Descripción",
    articulo: "la",
    tipo: "textarea",
    maxLength: 2000,
    ayuda: "Opcional. Se muestra en el detalle del producto.",
  },
  {
    nombre: "imagen_url",
    etiqueta: "URL de la imagen",
    articulo: "la",
    maxLength: 500,
    placeholder: "https://...",
    ayuda: "Opcional.",
  },
  {
    nombre: "requiere_formula",
    etiqueta: "Requiere fórmula médica",
    tipo: "checkbox",
    inicial: false,
  },
  {
    nombre: "activo",
    etiqueta: "Activo (visible en la tienda)",
    tipo: "checkbox",
    inicial: true,
  },
];

function ProductosTab({ alGuardar }) {
  const { handleUnauthorized } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  // Todas las categorías, también las canceladas: un producto puede seguir
  // asignado a una categoría cancelada
  useEffect(() => {
    let activo = true;
    categoriasApi
      .listar({ todos: true })
      .then((datos) => {
        if (activo) setCategorias(datos);
      })
      .catch((error) => {
        if (!activo) return;
        if (error.status === 401) handleUnauthorized();
        else setErrorCategorias(error.message);
      });
    return () => {
      activo = false;
    };
  }, [handleUnauthorized]);

  const campos = useMemo(() => crearCampos(categorias), [categorias]);
  const filtros = useMemo(
    () => (categoriaFiltro ? { categoria: categoriaFiltro } : {}),
    [categoriaFiltro]
  );

  return (
    <>
      {errorCategorias && (
        <p className="panel-summary-error crud-tab-warning" role="alert">
          No se pudieron cargar las categorías: {errorCategorias}
        </p>
      )}
      <CrudTable
        api={api}
        singular="producto"
        columnas={columnas}
        campos={campos}
        campoActivo="activo"
        filtros={filtros}
        textoBusqueda="Buscar producto por nombre o descripción..."
        avisoBorrar="Si el producto ya está en algún pedido, el servidor no permitirá borrarlo: cancélalo en su lugar."
        alGuardar={alGuardar}
        herramientas={
          <Form.Select
            aria-label="Filtrar por categoría"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </Form.Select>
        }
      />
    </>
  );
}

export default ProductosTab;
