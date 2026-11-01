// "Mis pedidos" en /perfil: los pedidos del usuario con sesión iniciada.
// Reutiliza CrudTable y PedidoModal del panel, en modo cliente:
//   - el servidor solo devuelve los pedidos del cliente (GET /api/pedidos);
//     al administrador se le filtra por su propio id (?usuario=);
//   - "Nuevo pedido" crea un pedido a su nombre;
//   - mientras el pedido está "pendiente" puede cambiar la dirección y los
//     productos, o cancelarlo; después solo lo puede ver.
import { useCallback, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import { crearCrud } from "../../api/crud.js";
import { useAuth } from "../../context/auth-context.js";
import { formatFecha, formatPrice } from "../../utils/format.js";
import { ESTADOS_PEDIDO, estadoDe } from "../../utils/pedidos.js";
import CrudTable from "../panel/CrudTable.jsx";
import PedidoModal from "../panel/PedidoModal.jsx";

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
    clave: "direccion_entrega",
    titulo: "Entrega en",
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

// El cliente solo puede cancelar sus pedidos pendientes
const filaProtegida = (fila) => fila.estado !== "pendiente";

function MisPedidos() {
  const { user } = useAuth();
  const [estadoFiltro, setEstadoFiltro] = useState("");

  // El servidor ya limita al cliente a sus pedidos; al administrador (que
  // vería todos) se le pide solo los suyos.
  const filtros = useMemo(
    () => ({
      ...(user.rol === "administrador" ? { usuario: user.id } : {}),
      ...(estadoFiltro ? { estado: estadoFiltro } : {}),
    }),
    [user, estadoFiltro]
  );

  const estaActivo = useCallback(
    (fila) => fila.estado !== "cancelado" || estadoFiltro === "cancelado",
    [estadoFiltro]
  );

  const formularioPropio = useCallback(
    (props) => <PedidoModal {...props} paraCliente />,
    []
  );

  return (
    <section className="mis-pedidos" aria-labelledby="mis-pedidos-titulo">
      <div className="panel-heading">
        <span className="section-kicker">MIS PEDIDOS</span>
        <h2 id="mis-pedidos-titulo">Tus compras en FarmaUIS</h2>
        <p>
          Haz un pedido nuevo o revisa los anteriores. Mientras un pedido está
          pendiente puedes cambiar la dirección y los productos, o cancelarlo.
        </p>
      </div>

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
        textoBusqueda="Buscar por dirección..."
        avisoCancelar='pasará a "cancelado" y no se enviará'
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
    </section>
  );
}

export default MisPedidos;
