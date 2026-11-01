// Página privada /mis-pedidos: historial de pedidos del usuario con sesión.
// Los pedidos se crean desde el carrito (/carrito); aquí se consultan y,
// mientras están "pendientes", se puede cambiar la dirección y los productos
// o cancelarlos. Después solo se pueden ver.
// Reutiliza CrudTable y PedidoModal (en modo cliente) del panel:
//   - el servidor solo devuelve al cliente sus pedidos (GET /api/pedidos);
//     al administrador se le filtra por su propio id (?usuario=).
import { useCallback, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { FaCartShopping } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { crearCrud } from "../api/crud.js";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import CrudTable from "../components/panel/CrudTable.jsx";
import PedidoModal from "../components/panel/PedidoModal.jsx";
import {
  COLUMNA_ESTADO,
  COLUMNA_PEDIDO,
  COLUMNA_PRODUCTOS,
  COLUMNA_TOTAL,
  nombrePedido,
  pedidoActivo,
} from "../components/panel/columnasPedido.jsx";
import FiltroEstado from "../components/panel/FiltroEstado.jsx";
import { useAuth } from "../context/auth-context.js";

const api = crearCrud("pedidos");

const columnas = [
  COLUMNA_PEDIDO,
  { clave: "direccion_entrega", titulo: "Entrega en" },
  COLUMNA_PRODUCTOS,
  COLUMNA_TOTAL,
  COLUMNA_ESTADO,
];

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

  const estaActivo = useMemo(() => pedidoActivo(estadoFiltro), [estadoFiltro]);

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
          nombreFila={nombrePedido}
          formularioPropio={formularioPropio}
          textoBusqueda="Buscar por dirección..."
          avisoCancelar='pasará a "cancelado" y no se enviará'
          herramientas={<FiltroEstado valor={estadoFiltro} alCambiar={setEstadoFiltro} />}
        />
      </main>

      <SiteFooter />
    </div>
  );
}

export default MisPedidosPage;
