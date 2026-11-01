// Página /carrito: carrito de compras. Es pública: el visitante puede armar
// su carrito, y al confirmar se le pide iniciar sesión (modal de login, sin
// salir de la página).
// - Al abrir la página se actualizan precio y stock con el servidor; los
//   productos sin stock se marcan y hay que quitarlos para confirmar.
// - "Confirmar pedido" crea el pedido en la base de datos (POST /api/pedidos)
//   con la dirección y los productos. El servidor pone el precio de cada
//   producto y descuenta el stock; luego se vacía el carrito y se va a
//   "Mis pedidos".
import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { FaCartShopping, FaMinus, FaPlus, FaTrashCan } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { crearCrud } from "../api/crud.js";
import LoginModal from "../components/auth/LoginModal.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import ProductoIlustracion from "../components/home/ProductoIlustracion.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import { useAuth } from "../context/auth-context.js";
import { useCart } from "../context/cart-context.js";
import { formatPrice, plural } from "../utils/format.js";
import { ilustracionDe } from "../utils/ilustraciones.js";

const pedidosApi = crearCrud("pedidos");
const productosApi = crearCrud("productos");

function CarritoPage() {
  const { status } = useAuth();
  const { items, unidades, total, cambiarCantidad, quitar, vaciar, actualizarProductos } =
    useCart();
  const navigate = useNavigate();

  const [direccion, setDireccion] = useState("");
  const [errorDireccion, setErrorDireccion] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);

  // Precio y stock al día. Sin backend (modo demostración) se queda con lo
  // que se guardó al agregar.
  const refrescar = useCallback(
    () =>
      productosApi
        .listar()
        .then(actualizarProductos)
        .catch(() => {}),
    [actualizarProductos]
  );

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const sinStock = items.filter((item) => item.disponible === false);
  const conFormula = items.some((item) => item.requiereFormula);
  const conSesion = status === "authenticated";

  const confirmar = async (evento) => {
    evento.preventDefault();
    setError("");

    if (!conSesion) {
      setMostrarLogin(true);
      return;
    }
    if (sinStock.length) {
      setError("Quita los productos sin stock para poder confirmar el pedido.");
      return;
    }
    const texto = direccion.trim();
    if (!texto) {
      setErrorDireccion("Escribe la dirección de entrega.");
      return;
    }

    setEnviando(true);
    try {
      const pedido = await pedidosApi.crear({
        direccion_entrega: texto,
        lineas: items.map((item) => ({ producto_id: item.id, cantidad: item.cantidad })),
      });
      vaciar();
      navigate("/mis-pedidos", {
        state: {
          aviso: `¡Listo! Tu pedido #${pedido.id} quedó registrado por ${formatPrice(Number(pedido.total))}. Puedes cambiarlo o cancelarlo mientras esté pendiente.`,
        },
      });
    } catch (err) {
      if (err.status === 401) {
        // La sesión venció: se vuelve a pedir el login sin perder el carrito
        setMostrarLogin(true);
      } else {
        setError(err.message);
        // Si fue por stock, se actualiza el carrito para que se vea el cambio
        if (err.status === 409 || err.status === 400) refrescar();
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="panel-page">
        <div className="panel-heading">
          <span className="section-kicker">CARRITO DE COMPRAS</span>
          <h1>Tu carrito</h1>
          <p>
            {items.length
              ? `${plural(unidades, "unidad", "unidades")} de ${plural(items.length, "producto", "productos")}.`
              : "Agrega productos desde el catálogo para hacer tu pedido."}
          </p>
        </div>

        {!items.length ? (
          <div className="empty-state">
            <FaCartShopping className="empty-state-icon" aria-hidden="true" />
            <h3>Tu carrito está vacío</h3>
            <p>Busca lo que necesitas en el catálogo y usa "Agregar al carrito".</p>
            <Link className="crud-button is-primary" to="/#productos">
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="carrito">
            {/* Productos del carrito */}
            <ul className="carrito-lista">
              {items.map((item) => {
                const agotado = item.disponible === false;
                return (
                  <li key={item.id} className={`carrito-item${agotado ? " is-agotado" : ""}`}>
                    <span className={`carrito-item-art art-${item.color || "green"}`}>
                      <ProductoIlustracion tipo={item.ilustracion || ilustracionDe(item.nombre)} />
                    </span>
                    <div className="carrito-item-info">
                      <strong>{item.nombre}</strong>
                      <span className="crud-cell-sub">
                        {formatPrice(item.precio)} c/u
                        {item.requiereFormula ? " · Requiere fórmula médica" : ""}
                      </span>
                      {agotado && (
                        <span className="carrito-agotado" role="note">
                          Ya no hay stock de este producto. Quítalo para continuar.
                        </span>
                      )}
                    </div>

                    {!agotado && (
                      <div className="carrito-cantidad" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                        <button
                          type="button"
                          className="crud-icon-button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1 || enviando}
                          aria-label={`Quitar una unidad de ${item.nombre}`}
                        >
                          <FaMinus aria-hidden="true" />
                        </button>
                        <span className="carrito-cantidad-numero" aria-live="polite">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          className="crud-icon-button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock || enviando}
                          aria-label={`Agregar una unidad de ${item.nombre}`}
                          title={item.cantidad >= item.stock ? `Solo hay ${item.stock} disponibles` : undefined}
                        >
                          <FaPlus aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    <span className="carrito-subtotal">
                      {agotado ? "—" : formatPrice(item.precio * item.cantidad)}
                    </span>

                    <button
                      type="button"
                      className="crud-icon-button is-danger"
                      onClick={() => quitar(item.id)}
                      disabled={enviando}
                      aria-label={`Quitar ${item.nombre} del carrito`}
                      title="Quitar del carrito"
                    >
                      <FaTrashCan aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Resumen y confirmación */}
            <Form className="carrito-resumen" onSubmit={confirmar} noValidate>
              <h2>Resumen</h2>
              <p className="carrito-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </p>

              {conFormula && (
                <p className="product-modal-notice notice-formula" role="note">
                  <strong>Tienes productos con fórmula médica.</strong> Ten la
                  fórmula a la mano al recibir tu pedido.
                </p>
              )}

              {conSesion ? (
                <Form.Group controlId="carrito-direccion" className="crud-field">
                  <Form.Label>
                    Dirección de entrega <span className="crud-required" aria-hidden="true">*</span>
                  </Form.Label>
                  <Form.Control
                    value={direccion}
                    maxLength={255}
                    placeholder="Calle 9 # 27-10, Bucaramanga"
                    onChange={(e) => {
                      setDireccion(e.target.value);
                      setErrorDireccion("");
                    }}
                    isInvalid={Boolean(errorDireccion)}
                    disabled={enviando}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errorDireccion}</Form.Control.Feedback>
                </Form.Group>
              ) : (
                <p className="carrito-nota">
                  Para confirmar el pedido necesitas iniciar sesión. Tu carrito
                  se conserva.
                </p>
              )}

              {error && (
                <Alert variant="danger" className="crud-alert" role="alert">
                  {error}
                </Alert>
              )}

              <button type="submit" className="crud-button is-primary carrito-confirmar" disabled={enviando}>
                {enviando
                  ? "Confirmando..."
                  : conSesion
                    ? "Confirmar pedido"
                    : "Iniciar sesión para confirmar"}
              </button>
              <p className="carrito-nota">
                El precio final lo confirma el servidor al crear el pedido.
              </p>
              <button
                type="button"
                className="carrito-vaciar"
                onClick={vaciar}
                disabled={enviando}
              >
                Vaciar carrito
              </button>
            </Form>
          </div>
        )}
      </main>

      {/* Login sin salir del carrito */}
      <LoginModal show={mostrarLogin} onHide={() => setMostrarLogin(false)} alEntrar={() => {}} />

      <SiteFooter />
    </div>
  );
}

export default CarritoPage;
