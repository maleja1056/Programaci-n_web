// Modal para crear y editar un pedido desde el panel de administración.
// Un pedido tiene varias líneas (tabla detalle_pedidos), por eso no usa el
// formulario genérico de CrudTable sino este.
//
// Crear: se elige el cliente, la dirección y los productos con su cantidad.
//   Todo se envía junto (POST /api/pedidos) y el servidor toma el precio de
//   cada producto y descuenta el stock en una sola transacción.
// Editar: se cambian el estado y la dirección (PUT /api/pedidos/:id, botón
//   "Guardar cambios"), y los productos del pedido: agregar, cambiar la
//   cantidad o quitar (/api/detalle-pedidos). Los cambios en los productos se
//   guardan al momento, porque cada uno mueve el stock en el servidor.
//   Solo se pueden cambiar los productos en "pendiente", "confirmado" o
//   "preparando".
// paraCliente (lo usa "Mis pedidos" en /perfil): el pedido es siempre del
//   usuario con sesión, así que no se elige cliente; el estado no se puede
//   cambiar, y la dirección y los productos solo mientras está "pendiente"
//   (las mismas reglas del backend, lib/pedidos.js).
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FaCheck, FaPlus, FaTrashCan } from "react-icons/fa6";
import { crearCrud } from "../../api/crud.js";
import { useAuth } from "../../context/auth-context.js";
import { formatFecha, formatPrice } from "../../utils/format.js";
import {
  ESTADOS_CON_PRODUCTOS_EDITABLES,
  ESTADOS_PEDIDO,
  MAX_CANTIDAD,
  estadoDe,
} from "../../utils/pedidos.js";

const pedidosApi = crearCrud("pedidos");
const detalleApi = crearCrud("detalle");
const productosApi = crearCrud("productos");
const usuariosApi = crearCrud("usuarios");

// Revisa una cantidad escrita: devuelve el mensaje de error o "" si está bien
function errorCantidad(texto, disponible) {
  const cantidad = Number(texto);
  if (texto === "" || !Number.isInteger(cantidad) || cantidad < 1) {
    return "Escribe una cantidad entera mayor que 0.";
  }
  if (cantidad > MAX_CANTIDAD) return `Máximo ${MAX_CANTIDAD} unidades por producto.`;
  if (disponible !== undefined && cantidad > disponible) {
    return `Solo hay ${disponible} disponibles.`;
  }
  return "";
}

// Fila para elegir un producto y su cantidad y agregarlo a la lista.
// "excluir" son los ids que ya están en el pedido (no se pueden repetir).
function AgregarProducto({ productos, excluir, onAgregar, ocupado, idBase }) {
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [error, setError] = useState("");

  const disponibles = productos.filter(
    (producto) => !excluir.includes(producto.id) && Number(producto.stock) > 0
  );
  const elegido = productos.find((producto) => String(producto.id) === productoId);

  const agregar = async () => {
    if (!elegido) return setError("Elige un producto.");
    const mensaje = errorCantidad(cantidad, Number(elegido.stock));
    if (mensaje) return setError(mensaje);
    setError("");
    const listo = await onAgregar(elegido, Number(cantidad));
    if (listo !== false) {
      setProductoId("");
      setCantidad("1");
    }
  };

  return (
    <div className="pedido-agregar">
      <Form.Group controlId={`${idBase}-producto`} className="pedido-agregar-producto">
        <Form.Label>Producto</Form.Label>
        <Form.Select
          value={productoId}
          onChange={(e) => {
            setProductoId(e.target.value);
            setError("");
          }}
          disabled={ocupado}
        >
          <option value="">
            {disponibles.length ? "Elige un producto..." : "No hay más productos con stock"}
          </option>
          {disponibles.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} · {formatPrice(Number(producto.precio))} · stock {producto.stock}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId={`${idBase}-cantidad`} className="pedido-agregar-cantidad">
        <Form.Label>Cantidad</Form.Label>
        <Form.Control
          type="number"
          min={1}
          max={elegido ? Math.min(Number(elegido.stock), MAX_CANTIDAD) : MAX_CANTIDAD}
          step={1}
          inputMode="numeric"
          value={cantidad}
          onChange={(e) => {
            setCantidad(e.target.value);
            setError("");
          }}
          disabled={ocupado}
        />
      </Form.Group>
      <button
        type="button"
        className="crud-button pedido-agregar-boton"
        onClick={agregar}
        disabled={ocupado || !disponibles.length}
      >
        <FaPlus aria-hidden="true" /> Agregar
      </button>
      {error && (
        <p className="pedido-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Contenido del modal. Se monta de nuevo cada vez que el modal se abre, así
// el formulario siempre empieza limpio.
function ContenidoPedido({
  modo,
  fila,
  paraCliente,
  tituloId,
  pedirCierre,
  alTerminar,
  alCambiarProductos,
}) {
  const { handleUnauthorized } = useAuth();
  const idBase = useId();
  const esNuevo = modo === "crear";

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedido, setPedido] = useState(null); // solo al editar
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  // Campos del pedido
  const [clienteId, setClienteId] = useState("");
  const [direccion, setDireccion] = useState(fila?.direccion_entrega || "");
  const [estado, setEstado] = useState(fila?.estado || "pendiente");
  // Productos de un pedido nuevo: [{ producto, cantidad }]
  const [lineasNuevas, setLineasNuevas] = useState([]);
  // Cantidades escritas en las líneas de un pedido existente: { idLinea: "3" }
  const [cantidades, setCantidades] = useState({});

  const [errores, setErrores] = useState({});
  const [errorGuardar, setErrorGuardar] = useState("");
  const [guardando, setGuardando] = useState(false);

  const manejarError = useCallback(
    (error, mostrar) => {
      if (error.status === 401) handleUnauthorized();
      else mostrar(error.message);
    },
    [handleUnauthorized]
  );

  // Productos activos (para agregar) y, al crear, los clientes activos
  const cargarProductos = useCallback(
    () => productosApi.listar().then(setProductos),
    []
  );

  const cargarPedido = useCallback(
    () =>
      pedidosApi.obtener(fila.id).then((datos) => {
        setPedido(datos);
        setCantidades({});
        return datos;
      }),
    [fila]
  );

  useEffect(() => {
    let activo = true;
    const tareas = [cargarProductos()];
    if (esNuevo && !paraCliente) {
      tareas.push(
        usuariosApi.listar().then((datos) => {
          if (activo) setClientes(datos.filter((usuario) => Number(usuario.activo)));
        })
      );
    } else if (!esNuevo) {
      tareas.push(cargarPedido());
    }
    Promise.all(tareas)
      .catch((error) => activo && manejarError(error, setErrorCarga))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [esNuevo, paraCliente, cargarProductos, cargarPedido, manejarError]);

  const lineasActuales = useMemo(
    () => (esNuevo ? [] : pedido?.detalle || []),
    [esNuevo, pedido]
  );
  const estadoGuardado = pedido?.estado || fila?.estado;
  const productosEditables =
    esNuevo ||
    (paraCliente
      ? estadoGuardado === "pendiente"
      : ESTADOS_CON_PRODUCTOS_EDITABLES.includes(estadoGuardado));
  const cancelado = estadoGuardado === "cancelado";
  // Sin nada que guardar: cancelado, o un pedido del cliente ya en camino
  const soloLectura =
    !esNuevo && (cancelado || (paraCliente && estadoGuardado !== "pendiente"));

  const total = esNuevo
    ? lineasNuevas.reduce((suma, linea) => suma + Number(linea.producto.precio) * linea.cantidad, 0)
    : Number(pedido?.total || 0);

  // ----- Productos de un pedido nuevo (solo en el formulario) -----
  const agregarNueva = (producto, cantidad) => {
    setLineasNuevas((lineas) => [...lineas, { producto, cantidad }]);
    setErrores((actual) => ({ ...actual, lineas: undefined }));
  };

  const cambiarCantidadNueva = (productoId, texto) =>
    setLineasNuevas((lineas) =>
      lineas.map((linea) =>
        linea.producto.id === productoId ? { ...linea, texto } : linea
      )
    );

  const quitarNueva = (productoId) =>
    setLineasNuevas((lineas) => lineas.filter((linea) => linea.producto.id !== productoId));

  // ----- Productos de un pedido existente (se guardan al momento) -----
  const operarLinea = async (accion) => {
    setGuardando(true);
    setErrorGuardar("");
    try {
      await accion();
      alCambiarProductos(); // al cerrar, PedidoModal recarga la tabla
      await Promise.all([cargarPedido(), cargarProductos()]);
      return true;
    } catch (error) {
      manejarError(error, setErrorGuardar);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const agregarExistente = (producto, cantidad) =>
    operarLinea(() =>
      detalleApi.crear({ pedido_id: fila.id, producto_id: producto.id, cantidad })
    );

  const actualizarCantidad = (linea) => {
    const texto = cantidades[linea.id];
    const producto = productos.find((p) => p.id === linea.producto_id);
    // Disponible = lo que queda en stock + lo que ya tiene esta línea
    const disponible = producto ? Number(producto.stock) + Number(linea.cantidad) : undefined;
    const mensaje = errorCantidad(texto, disponible);
    if (mensaje) return setErrorGuardar(`${linea.producto}: ${mensaje}`);
    operarLinea(() => detalleApi.actualizar(linea.id, { cantidad: Number(texto) }));
  };

  const quitarExistente = (linea) => operarLinea(() => detalleApi.cancelar(linea.id));

  // ----- Guardar -----
  const validar = () => {
    const nuevos = {};
    if (esNuevo && !paraCliente && !clienteId) nuevos.cliente = "Elige el cliente.";
    if (!direccion.trim()) nuevos.direccion = "Escribe la dirección de entrega.";
    else if (direccion.trim().length > 255) nuevos.direccion = "Máximo 255 caracteres.";
    if (esNuevo) {
      if (!lineasNuevas.length) nuevos.lineas = "Agrega al menos un producto.";
      for (const linea of lineasNuevas) {
        if (linea.texto === undefined) continue;
        const mensaje = errorCantidad(linea.texto, Number(linea.producto.stock));
        if (mensaje) nuevos.lineas = `${linea.producto.nombre}: ${mensaje}`;
      }
    }
    setErrores(nuevos);
    return !Object.keys(nuevos).length;
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    setErrorGuardar("");
    try {
      if (esNuevo) {
        const creado = await pedidosApi.crear({
          // El cliente no lo envía: el servidor usa el de la sesión
          ...(paraCliente ? {} : { usuario_id: Number(clienteId) }),
          direccion_entrega: direccion.trim(),
          lineas: lineasNuevas.map((linea) => ({
            producto_id: linea.producto.id,
            cantidad: linea.texto === undefined ? linea.cantidad : Number(linea.texto),
          })),
        });
        alTerminar(`Pedido #${creado.id} creado correctamente.`);
      } else {
        // Solo se envía lo que cambió
        const cambios = {};
        if (direccion.trim() !== pedido.direccion_entrega) cambios.direccion_entrega = direccion.trim();
        if (estado !== pedido.estado) cambios.estado = estado;
        if (!Object.keys(cambios).length) {
          pedirCierre();
          return;
        }
        await pedidosApi.actualizar(fila.id, cambios);
        alTerminar(`Cambios del pedido #${fila.id} guardados.`);
      }
    } catch (error) {
      manejarError(error, setErrorGuardar);
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = () => {
    if (!guardando) pedirCierre();
  };

  // ----- Vista -----
  const titulo = esNuevo ? "Nuevo pedido" : `Pedido #${fila.id}`;

  return (
    <Form noValidate onSubmit={guardar}>
      <Modal.Header closeButton={!guardando} onHide={cerrar}>
        <div>
          <span className="section-kicker">{esNuevo ? "NUEVO REGISTRO" : "EDITAR REGISTRO"}</span>
          <Modal.Title id={tituloId}>{titulo}</Modal.Title>
          {!esNuevo && (
            <p className="pedido-meta">
              {paraCliente
                ? `Hecho el ${formatFecha(fila.creado_en)}`
                : `${fila.cliente} · ${fila.cliente_correo} · ${formatFecha(fila.creado_en)}`}
            </p>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        {errorGuardar && (
          <Alert variant="danger" className="crud-alert" role="alert">
            {errorGuardar}
          </Alert>
        )}

        {cargando ? (
          <div className="auth-loading" role="status">
            <span className="auth-spinner" aria-hidden="true" />
            Cargando...
          </div>
        ) : errorCarga ? (
          <Alert variant="danger" className="crud-alert" role="alert">
            No se pudieron cargar los datos: {errorCarga}
          </Alert>
        ) : (
          <>
            <div className="crud-form-grid">
              {esNuevo && paraCliente ? null : paraCliente ? (
                // El cliente ve el estado, pero no lo cambia
                <div className="crud-field is-half">
                  <span className="form-label d-block">Estado</span>
                  <span className={`crud-badge ${estadoDe(estadoGuardado).clase}`}>
                    {estadoDe(estadoGuardado).texto}
                  </span>
                  <Form.Text className="d-block">
                    {estadoGuardado === "pendiente"
                      ? "Puedes cambiarlo o cancelarlo mientras esté pendiente."
                      : "Ya no se puede modificar."}
                  </Form.Text>
                </div>
              ) : esNuevo ? (
                <Form.Group controlId={`${idBase}-cliente`} className="crud-field">
                  <Form.Label>
                    Cliente <span className="crud-required" aria-hidden="true">*</span>
                  </Form.Label>
                  <Form.Select
                    value={clienteId}
                    onChange={(e) => {
                      setClienteId(e.target.value);
                      setErrores((actual) => ({ ...actual, cliente: undefined }));
                    }}
                    isInvalid={Boolean(errores.cliente)}
                    required
                  >
                    <option value="">Elige el cliente...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} · {cliente.correo}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errores.cliente}</Form.Control.Feedback>
                </Form.Group>
              ) : (
                <Form.Group controlId={`${idBase}-estado`} className="crud-field is-half">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    disabled={cancelado || guardando}
                    aria-describedby={`${idBase}-estado-ayuda`}
                  >
                    {ESTADOS_PEDIDO.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.texto}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text id={`${idBase}-estado-ayuda`}>
                    {cancelado
                      ? "Un pedido cancelado no se puede reactivar."
                      : "Si eliges Cancelado, los productos vuelven al inventario."}
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group
                controlId={`${idBase}-direccion`}
                className={`crud-field${esNuevo ? "" : " is-half"}`}
              >
                <Form.Label>
                  Dirección de entrega <span className="crud-required" aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  value={direccion}
                  maxLength={255}
                  placeholder="Calle 9 # 27-10, Bucaramanga"
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    setErrores((actual) => ({ ...actual, direccion: undefined }));
                  }}
                  isInvalid={Boolean(errores.direccion)}
                  disabled={soloLectura || guardando}
                  required
                />
                <Form.Control.Feedback type="invalid">{errores.direccion}</Form.Control.Feedback>
              </Form.Group>
            </div>

            {/* Productos del pedido (tabla detalle_pedidos) */}
            <h3 className="pedido-subtitulo">Productos del pedido</h3>
            {!esNuevo && productosEditables && (
              <p className="pedido-nota">
                Los cambios en los productos se guardan al momento y ajustan el stock.
              </p>
            )}
            {!esNuevo && !productosEditables && (
              <p className="pedido-nota">
                En estado "{estadoDe(estadoGuardado).texto}" ya no se pueden cambiar los productos.
              </p>
            )}

            <ul className="pedido-lineas">
              {esNuevo
                ? lineasNuevas.map((linea) => {
                    const texto = linea.texto ?? String(linea.cantidad);
                    const cantidad = Number(texto) || 0;
                    return (
                      <li key={linea.producto.id} className="pedido-linea">
                        <span className="pedido-linea-nombre">
                          {linea.producto.nombre}
                          <span className="crud-cell-sub">
                            {formatPrice(Number(linea.producto.precio))} c/u · stock {linea.producto.stock}
                          </span>
                        </span>
                        <Form.Control
                          type="number"
                          min={1}
                          max={Math.min(Number(linea.producto.stock), MAX_CANTIDAD)}
                          step={1}
                          inputMode="numeric"
                          className="pedido-linea-cantidad"
                          aria-label={`Cantidad de ${linea.producto.nombre}`}
                          value={texto}
                          onChange={(e) => cambiarCantidadNueva(linea.producto.id, e.target.value)}
                        />
                        <span className="pedido-linea-subtotal">
                          {formatPrice(Number(linea.producto.precio) * cantidad)}
                        </span>
                        <button
                          type="button"
                          className="crud-icon-button is-danger"
                          onClick={() => quitarNueva(linea.producto.id)}
                          aria-label={`Quitar ${linea.producto.nombre}`}
                          title="Quitar"
                        >
                          <FaTrashCan aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })
                : lineasActuales.map((linea) => {
                    const texto = cantidades[linea.id] ?? String(linea.cantidad);
                    const cambio = texto !== String(linea.cantidad);
                    const unica = lineasActuales.length === 1;
                    return (
                      <li key={linea.id} className="pedido-linea">
                        <span className="pedido-linea-nombre">
                          {linea.producto}
                          <span className="crud-cell-sub">
                            {formatPrice(Number(linea.precio_unitario))} c/u
                          </span>
                        </span>
                        {productosEditables ? (
                          <span className="pedido-linea-editar">
                            <Form.Control
                              type="number"
                              min={1}
                              max={MAX_CANTIDAD}
                              step={1}
                              inputMode="numeric"
                              className="pedido-linea-cantidad"
                              aria-label={`Cantidad de ${linea.producto}`}
                              value={texto}
                              disabled={guardando}
                              onChange={(e) =>
                                setCantidades((actual) => ({ ...actual, [linea.id]: e.target.value }))
                              }
                            />
                            {cambio && (
                              <button
                                type="button"
                                className="crud-icon-button"
                                onClick={() => actualizarCantidad(linea)}
                                disabled={guardando}
                                aria-label={`Guardar la cantidad de ${linea.producto}`}
                                title="Guardar cantidad"
                              >
                                <FaCheck aria-hidden="true" />
                              </button>
                            )}
                          </span>
                        ) : (
                          <span className="pedido-linea-cantidad-texto">× {linea.cantidad}</span>
                        )}
                        <span className="pedido-linea-subtotal">
                          {formatPrice(Number(linea.subtotal))}
                        </span>
                        {productosEditables && (
                          <button
                            type="button"
                            className="crud-icon-button is-danger"
                            onClick={() => quitarExistente(linea)}
                            disabled={guardando || unica}
                            aria-label={`Quitar ${linea.producto} del pedido`}
                            title={
                              unica
                                ? "Un pedido necesita al menos un producto: cancela el pedido en su lugar"
                                : "Quitar del pedido"
                            }
                          >
                            <FaTrashCan aria-hidden="true" />
                          </button>
                        )}
                      </li>
                    );
                  })}
            </ul>

            {esNuevo && !lineasNuevas.length && (
              <p className="pedido-nota">Todavía no has agregado productos.</p>
            )}
            {errores.lineas && (
              <p className="pedido-error" role="alert">
                {errores.lineas}
              </p>
            )}

            {productosEditables && (
              <AgregarProducto
                productos={productos}
                excluir={
                  esNuevo
                    ? lineasNuevas.map((linea) => linea.producto.id)
                    : lineasActuales.map((linea) => linea.producto_id)
                }
                onAgregar={esNuevo ? agregarNueva : agregarExistente}
                ocupado={guardando}
                idBase={idBase}
              />
            )}

            <p className="pedido-total">
              Total <strong>{formatPrice(total)}</strong>
            </p>
            {esNuevo && (
              <p className="crud-note">
                El precio de cada producto lo pone el servidor al crear el pedido.{" "}
                <span aria-hidden="true">*</span> Campo obligatorio
              </p>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="crud-button" onClick={cerrar} disabled={guardando}>
          Cerrar
        </button>
        {!soloLectura && !errorCarga && (
          <button
            type="submit"
            className="crud-button is-primary"
            disabled={guardando || cargando}
          >
            {guardando ? "Guardando..." : esNuevo ? "Crear pedido" : "Guardar cambios"}
          </button>
        )}
      </Modal.Footer>
    </Form>
  );
}

function PedidoModal({ abierto, modo, fila, paraCliente = false, alCerrar, alTerminar }) {
  const tituloId = useId();
  // true si se agregaron, cambiaron o quitaron productos de un pedido
  // existente: esos cambios ya están guardados, así que al cerrar (con
  // "Cerrar", la X o Escape) se recarga la tabla.
  const huboCambios = useRef(false);

  const cerrar = () => {
    if (huboCambios.current) alTerminar(`Productos del pedido #${fila.id} actualizados.`);
    else alCerrar();
    huboCambios.current = false;
  };

  const terminar = (texto) => {
    huboCambios.current = false;
    alTerminar(texto);
  };

  return (
    <Modal
      show={abierto}
      onHide={cerrar}
      centered
      size="lg"
      backdrop="static"
      className="crud-modal"
      aria-labelledby={tituloId}
    >
      {abierto && (
        <ContenidoPedido
          key={`${modo}-${fila?.id ?? "nuevo"}`}
          modo={modo}
          fila={fila}
          paraCliente={paraCliente}
          tituloId={tituloId}
          pedirCierre={cerrar}
          alTerminar={terminar}
          alCambiarProductos={() => {
            huboCambios.current = true;
          }}
        />
      )}
    </Modal>
  );
}

export default PedidoModal;
