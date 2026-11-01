// Pestaña "Pedidos" del panel de administración (/panel).
// Mantenimiento de las tablas pedidos y detalle_pedidos con CrudTable:
// listar, buscar (cliente, correo o dirección), filtrar por estado, crear,
// editar y cancelar. El formulario es PedidoModal, porque un pedido tiene
// varios productos.
// - Cancelar pone el pedido en "cancelado" y devuelve los productos al stock.
//   Un pedido cancelado no se reactiva y uno entregado no se cancela.
// - Los pedidos no se borran: quedan como historial de ventas.
import { useCallback, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import { crearCrud } from "../../api/crud.js";
import { formatPrice } from "../../utils/format.js";
import { ESTADOS_PEDIDO, estadoDe, formatFecha } from "../../utils/pedidos.js";
import CrudTable from "./CrudTable.jsx";
import PedidoModal from "./PedidoModal.jsx";

// Se crea una sola vez (fuera del componente) para que CrudTable no vuelva a
// pedir la lista en cada render
const api = crearCrud("pedidos");

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

const columnas = [
  {
    clave: "id",
    titulo: "Pedido",
    render: (fila) => (
      <>
        <span className="crud-cell-strong">Pedido #{fila.id}</span>
        <span className="crud-cell-sub">{formatFecha(fila.creado_en)}</span>
      </>
    ),
  },
  {
    clave: "cliente",
    titulo: "Cliente",
    render: (fila) => (
      <>
        {fila.cliente}
        <span className="crud-cell-sub">{fila.cliente_correo}</span>
      </>
    ),
  },
  {
    clave: "unidades",
    titulo: "Productos",
    render: (fila) =>
      `${plural(Number(fila.unidades), "unidad", "unidades")} · ${plural(Number(fila.lineas), "producto", "productos")}`,
  },
  {
    clave: "total",
    titulo: "Total",
    className: "crud-cell-number",
    render: (fila) => formatPrice(Number(fila.total)),
  },
  {
    clave: "estado",
    titulo: "Estado",
    render: (fila) => {
      const estado = estadoDe(fila.estado);
      return <span className={`crud-badge ${estado.clase}`}>{estado.texto}</span>;
    },
  },
];

const nombreFila = (fila) => `Pedido #${fila.id}`;

// Un pedido entregado o cancelado ya no se puede cancelar
const filaProtegida = (fila) => fila.estado === "entregado" || fila.estado === "cancelado";

function PedidosTab({ alGuardar }) {
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const filtros = useMemo(() => (estadoFiltro ? { estado: estadoFiltro } : {}), [estadoFiltro]);

  // "Activo" es todo pedido que no está cancelado. Si se filtra por
  // "Cancelado", se muestran sin tener que activar "Mostrar cancelados".
  const estaActivo = useCallback(
    (fila) => fila.estado !== "cancelado" || estadoFiltro === "cancelado",
    [estadoFiltro]
  );

  const formularioPropio = useCallback((props) => <PedidoModal {...props} />, []);

  return (
    <CrudTable
      api={api}
      singular="pedido"
      columnas={columnas}
      campos={[]}
      campoActivo={estaActivo}
      mostrarEstado={false}
      permitirReactivar={false}
      permitirBorrar={false}
      filaProtegida={filaProtegida}
      filtros={filtros}
      nombreFila={nombreFila}
      formularioPropio={formularioPropio}
      textoBusqueda="Buscar por cliente, correo o dirección..."
      avisoCancelar='pasará a "cancelado" y sus productos volverán al inventario'
      alGuardar={alGuardar}
      herramientas={
        <Form.Select
          aria-label="Filtrar por estado"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map(({ valor, texto }) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Form.Select>
      }
    />
  );
}

export default PedidosTab;
