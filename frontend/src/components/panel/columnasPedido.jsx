// Columnas de la tabla de pedidos que comparten la pestaña Pedidos del panel
// (PedidosTab) y la página Mis pedidos (MisPedidosPage).
import { formatFecha, formatPrice, plural } from "../../utils/format.js";
import { estadoDe } from "../../utils/pedidos.js";

// Columnas de CrudTable
export const COLUMNA_PEDIDO = {
  clave: "id",
  titulo: "Pedido",
  render: (fila) => (
    <>
      <span className="crud-cell-strong">Pedido #{fila.id}</span>
      <span className="crud-cell-sub">{formatFecha(fila.creado_en)}</span>
    </>
  ),
};

export const COLUMNA_PRODUCTOS = {
  clave: "unidades",
  titulo: "Productos",
  render: (fila) =>
    `${plural(Number(fila.unidades), "unidad", "unidades")} · ${plural(Number(fila.lineas), "producto", "productos")}`,
};

export const COLUMNA_TOTAL = {
  clave: "total",
  titulo: "Total",
  className: "crud-cell-number",
  render: (fila) => formatPrice(Number(fila.total)),
};

export const COLUMNA_ESTADO = {
  clave: "estado",
  titulo: "Estado",
  render: (fila) => {
    const estado = estadoDe(fila.estado);
    return <span className={`crud-badge ${estado.clase}`}>{estado.texto}</span>;
  },
};

export const nombrePedido = (fila) => `Pedido #${fila.id}`;

// "Activo" es todo pedido que no está cancelado. Si se filtra por
// "Cancelado", se muestran sin tener que activar "Mostrar cancelados".
export const pedidoActivo = (estadoFiltro) => (fila) =>
  fila.estado !== "cancelado" || estadoFiltro === "cancelado";
