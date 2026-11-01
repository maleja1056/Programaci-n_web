// Página privada /mis-pedidos: historial de pedidos del usuario con sesión.
// Los pedidos se crean desde el carrito (/carrito); aquí se consultan y,
// mientras están "pendientes", se puede cambiar la dirección y los productos
// o cancelarlos. Después solo se pueden ver.
// Reutiliza CrudTable y PedidoModal (en modo cliente) del panel:
//   - el servidor solo devuelve al cliente sus pedidos (GET /api/pedidos);
//     al administrador se le filtra por su propio id (?usuario=).
import { useCallback, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { FaCartShopping } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { crearCrud } from "../api/crud.js";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import CrudTable from "../components/panel/CrudTable.jsx";
import PedidoModal from "../components/panel/PedidoModal.jsx";
import { useAuth } from "../context/auth-context.js";
import { formatFecha, formatPrice } from "../utils/format.js";
import { ESTADOS_PEDIDO, estadoDe } from "../utils/pedidos.js";

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

function MisPedidosPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [estadoFiltro, setEstadoFiltro] = useState("");
  // Aviso que deja el carrito al confirmar un pedido (navigate con state)
  const [avisoCarrito, setAvisoCarrito] = useState(location.state?.aviso || "");

  const cerrarAviso = () => {
    setAvisoCarrito("");
    // Se borra del historial para que no vuelva a salir al recargar
    navigate(location.pathname, { replace: true, state: null });
  };

  // El servidor ya limita al cliente a sus pedidos; al administrador (que
  // vería todos) se le piden solo los suyos.
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
    <div className="app-shell">
      <SiteHeader />

      <main className="panel-page">
        <div className="panel-heading mis-pedidos-heading">
          <div>
            <span className="section-kicker">MIS PEDIDOS</span>
            <h1>Tus compras en FarmaUIS</h1>
            <p>
              Mientras un pedido está pendiente puedes cambiar la dirección y
              los productos, o cancelarlo.
            </p>
          </div>
          <Link className="crud-button is-primary" to="/carrito">
            <FaCartShopping aria-hidden="true" /> Ir al carrito
          </Link>
        </div>

        {avisoCarrito && (
          <Alert variant="success" className="crud-alert" dismissible onClose={cerrarAviso}>
            {avisoCarrito}
          </Alert>
        )}

        <CrudTable
          api={api}
          singular="pedido"
          columnas={columnas}
          campos={[]}
          campoActivo={estaActivo}
          mostrarEstado={false}
          permitirReactivar={false}
          permitirBorrar={false}
          permitirCrear={false}
          textoVacio="Agrega productos al carrito desde el catálogo y confirma tu pedido."
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
      </main>

      <SiteFooter />
    </div>
  );
}

export default MisPedidosPage;
