// Pestaña "Pedidos" del panel de administración (/panel).
// Mantenimiento de las tablas pedidos y detalle_pedidos con CrudTable:
// listar, buscar (cliente, correo o dirección), filtrar por estado, crear,
// editar y cancelar. El formulario es PedidoModal, porque un pedido tiene
// varios productos.
// - Cancelar pone el pedido en "cancelado" y devuelve los productos al stock.
//   Un pedido cancelado no se reactiva y uno entregado no se cancela.
// - Los pedidos no se borran: quedan como historial de ventas.
import { useCallback, useMemo, useState } from "react";
import { crearCrud } from "../../api/crud.js";
import CrudTable from "./CrudTable.jsx";
import PedidoModal from "./PedidoModal.jsx";
import {
  COLUMNA_ESTADO,
  COLUMNA_PEDIDO,
  COLUMNA_PRODUCTOS,
  COLUMNA_TOTAL,
  nombrePedido,
  pedidoActivo,
} from "./columnasPedido.jsx";
import FiltroEstado from "./FiltroEstado.jsx";

// Se crea una sola vez (fuera del componente) para que CrudTable no vuelva a
// pedir la lista en cada render
const api = crearCrud("pedidos");

const columnas = [
  COLUMNA_PEDIDO,
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
  COLUMNA_PRODUCTOS,
  COLUMNA_TOTAL,
  COLUMNA_ESTADO,
];

// Un pedido entregado o cancelado ya no se puede cancelar
const filaProtegida = (fila) => fila.estado === "entregado" || fila.estado === "cancelado";

function PedidosTab({ alGuardar }) {
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const filtros = useMemo(() => (estadoFiltro ? { estado: estadoFiltro } : {}), [estadoFiltro]);

  const estaActivo = useMemo(() => pedidoActivo(estadoFiltro), [estadoFiltro]);

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
      nombreFila={nombrePedido}
      formularioPropio={formularioPropio}
      textoBusqueda="Buscar por cliente, correo o dirección..."
      avisoCancelar='pasará a "cancelado" y sus productos volverán al inventario'
      alGuardar={alGuardar}
      herramientas={<FiltroEstado valor={estadoFiltro} alCambiar={setEstadoFiltro} />}
    />
  );
}

export default PedidosTab;
