// Tabla reutilizable para el CRUD de una tabla de la base de datos.
// La usan las pestañas del panel de administración (Categorías, Productos,
// Usuarios...). Cada pestaña solo describe sus columnas y su formulario; este
// componente se encarga de:
//   - listar las filas y buscarlas (?buscar=, con una pausa de 300 ms);
//   - mostrar u ocultar las filas canceladas (inactivas);
//   - el botón "Nuevo" y "Editar", que abren un modal con el formulario;
//   - "Cancelar" (desactivar), "Reactivar" y "Borrar definitivamente",
//     siempre con una ventana de confirmación;
//   - los estados de carga, vacío y error, y los mensajes del servidor.
//
// Props principales (ver las pestañas en components/panel/ para ejemplos):
//   api           objeto de crearCrud("tabla") (api/crud.js)
//   singular      nombre de una fila, por ejemplo "categoría"
//   columnas      [{ clave, titulo, render?(fila), className? }]; la primera
//                 es la principal (en celulares encabeza la tarjeta de la fila)
//   campos        campos del formulario (ver CampoFormulario más abajo)
//   campoActivo   columna que indica si la fila está activa ("activo"/"activa")
//   filtros       filtros extra para listar (por ejemplo { categoria: 3 })
//   herramientas  elementos extra junto al buscador (por ejemplo un select)
//   nombreFila    (fila) => texto con el que se nombra la fila al confirmar
//   alGuardar     se llama después de crear, editar o cancelar (opcional)
//   avisoBorrar   texto extra al confirmar el borrado (qué pasa con los datos
//                 relacionados; depende de la tabla)
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {
  FaBan,
  FaMagnifyingGlass,
  FaPen,
  FaPlus,
  FaRotateLeft,
  FaTrashCan,
  FaXmark,
} from "react-icons/fa6";
import { useAuth } from "../../context/auth-context.js";

// ---------- Conversión entre la fila, el formulario y los datos a enviar ----------

// Valor vacío de cada tipo de campo para el formulario "Nuevo"
const valorVacio = (campo) => {
  if (campo.inicial !== undefined) return campo.inicial;
  return campo.tipo === "checkbox" ? false : "";
};

// Fila de la API → valores del formulario (todo como texto, menos los checkbox)
function filaAFormulario(campos, fila) {
  const valores = {};
  for (const campo of campos) {
    if (campo.tipo === "password") {
      valores[campo.nombre] = ""; // la contraseña nunca viene de la API
    } else if (campo.tipo === "checkbox") {
      valores[campo.nombre] = Boolean(Number(fila?.[campo.nombre]));
    } else {
      const valor = fila?.[campo.nombre];
      valores[campo.nombre] = valor === null || valor === undefined ? "" : String(valor);
    }
  }
  return valores;
}

// Valores del formulario → cuerpo de la petición POST/PUT.
// Los números se envían como números y los textos opcionales vacíos como null.
function formularioADatos(campos, valores, modo) {
  const datos = {};
  for (const campo of campos) {
    if (campo.soloCrear && modo === "editar") continue;
    let valor = valores[campo.nombre];

    if (campo.tipo === "checkbox") {
      datos[campo.nombre] = Boolean(valor);
      continue;
    }

    valor = typeof valor === "string" ? valor.trim() : valor;

    if (valor === "") {
      // Contraseña vacía al editar: se deja la que tenía
      if (campo.tipo === "password" || campo.omitirSiVacio) continue;
      datos[campo.nombre] = null;
      continue;
    }

    datos[campo.nombre] =
      campo.tipo === "numero" || campo.numerico ? Number(valor) : valor;
  }
  return datos;
}

// Validación en el navegador antes de enviar. El servidor vuelve a validar.
function validar(campos, valores, modo) {
  const errores = {};
  for (const campo of campos) {
    if (campo.soloCrear && modo === "editar") continue;
    const valor = valores[campo.nombre];
    const texto = typeof valor === "string" ? valor.trim() : valor;
    const obligatorio =
      campo.obligatorio === true || campo.obligatorio === modo;

    if (campo.tipo === "checkbox") continue;

    if (texto === "") {
      if (obligatorio) errores[campo.nombre] = `Escribe ${campo.articulo || "el"} ${campo.etiqueta.toLowerCase()}.`;
      continue;
    }

    if (campo.tipo === "numero") {
      const numero = Number(texto);
      if (!Number.isFinite(numero)) errores[campo.nombre] = "Escribe un número.";
      else if (campo.min !== undefined && numero < campo.min)
        errores[campo.nombre] = `Debe ser mayor o igual a ${campo.min}.`;
      else if (campo.max !== undefined && numero > campo.max)
        errores[campo.nombre] = `Debe ser menor o igual a ${campo.max}.`;
      else if (campo.entero && !Number.isInteger(numero))
        errores[campo.nombre] = "Debe ser un número entero.";
    } else if (campo.minLength && texto.length < campo.minLength) {
      errores[campo.nombre] = `Debe tener al menos ${campo.minLength} caracteres.`;
    }
  }
  return errores;
}

const estaActiva = (fila, campoActivo) =>
  !campoActivo || Boolean(Number(fila[campoActivo]));

// ---------- Un campo del formulario ----------
// Cada campo es un objeto:
//   { nombre, etiqueta, tipo: "texto" | "textarea" | "numero" | "email" |
//     "password" | "select" | "checkbox", obligatorio (true, "crear" o
//     "editar"), opciones: [{ valor, texto }] (select), min, max, step,
//     entero, maxLength, minLength, ayuda, placeholder, soloCrear,
//     numerico (select con ids), omitirSiVacio, articulo ("el"/"la"),
//     ancho: "medio" (ocupa media fila en pantallas anchas) }
function CampoFormulario({ campo, valor, error, modo, onChange, idBase }) {
  const id = `${idBase}-${campo.nombre}`;
  const obligatorio = campo.obligatorio === true || campo.obligatorio === modo;
  const ayuda = typeof campo.ayuda === "function" ? campo.ayuda(modo) : campo.ayuda;
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  const clase = `crud-field${campo.ancho === "medio" ? " is-half" : ""}`;

  if (campo.tipo === "checkbox") {
    return (
      <Form.Group className={`${clase} crud-field-check`} controlId={id}>
        <Form.Check
          type="switch"
          label={campo.etiqueta}
          checked={Boolean(valor)}
          onChange={(e) => onChange(campo.nombre, e.target.checked)}
          aria-describedby={ayudaId}
        />
        {ayuda && <Form.Text id={ayudaId}>{ayuda}</Form.Text>}
      </Form.Group>
    );
  }

  const comunes = {
    value: valor,
    isInvalid: Boolean(error),
    required: obligatorio,
    "aria-describedby": ayudaId,
    onChange: (e) => onChange(campo.nombre, e.target.value),
  };

  let control;
  if (campo.tipo === "select") {
    control = (
      <Form.Select {...comunes}>
        {!obligatorio || valor === "" ? (
          <option value="">{campo.placeholder || "Sin seleccionar"}</option>
        ) : null}
        {campo.opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </Form.Select>
    );
  } else if (campo.tipo === "textarea") {
    control = (
      <Form.Control
        as="textarea"
        rows={3}
        maxLength={campo.maxLength}
        placeholder={campo.placeholder}
        {...comunes}
      />
    );
  } else {
    const tipos = { numero: "number", email: "email", password: "password" };
    control = (
      <Form.Control
        type={tipos[campo.tipo] || "text"}
        min={campo.min}
        max={campo.max}
        step={campo.step}
        maxLength={campo.maxLength}
        placeholder={campo.placeholder}
        autoComplete={campo.tipo === "password" ? "new-password" : "off"}
        inputMode={campo.tipo === "numero" ? "decimal" : undefined}
        {...comunes}
      />
    );
  }

  return (
    <Form.Group className={clase} controlId={id}>
      <Form.Label>
        {campo.etiqueta}
        {obligatorio && <span className="crud-required" aria-hidden="true"> *</span>}
      </Form.Label>
      {control}
      {error ? (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      ) : (
        ayuda && <Form.Text id={ayudaId}>{ayuda}</Form.Text>
      )}
    </Form.Group>
  );
}

// ---------- Componente principal ----------

function CrudTable({
  api,
  singular,
  femenino = false,
  columnas,
  campos,
  campoActivo,
  filtros,
  herramientas,
  nombreFila = (fila) => fila.nombre,
  textoBusqueda = "Buscar...",
  permitirBorrar = true,
  avisoBorrar = "",
  alGuardar,
}) {
  const { handleUnauthorized } = useAuth();
  const idBase = useId();

  // Última respuesta recibida y la consulta a la que corresponde. Mientras la
  // consulta actual sea distinta, la tabla está "cargando" (y sigue mostrando
  // las filas anteriores para que no parpadee).
  const [resultado, setResultado] = useState({ consulta: null, filas: [], error: "" });
  const [buscar, setBuscar] = useState("");
  const [buscarAplicado, setBuscarAplicado] = useState("");
  const [verInactivas, setVerInactivas] = useState(false);
  const [recargar, setRecargar] = useState(0);
  const [aviso, setAviso] = useState(null); // { tipo, texto } tras guardar

  // Formulario: { modo: "crear" | "editar", fila, valores, errores }
  const [formulario, setFormulario] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");

  // Confirmación: { accion: "cancelar" | "reactivar" | "borrar", fila }
  const [confirmacion, setConfirmacion] = useState(null);

  const un = femenino ? "una" : "un";
  const nuevo = femenino ? "Nueva" : "Nuevo";
  const cancelado = femenino ? "cancelada" : "cancelado";
  const Singular = singular.charAt(0).toUpperCase() + singular.slice(1);

  // Errores comunes: sin sesión se vuelve al login; los demás se muestran
  const manejarError = useCallback(
    (error, mostrar) => {
      if (error.status === 401) handleUnauthorized();
      else mostrar(error.message);
    },
    [handleUnauthorized]
  );

  // El texto del buscador se aplica 300 ms después de dejar de escribir
  useEffect(() => {
    const espera = setTimeout(() => setBuscarAplicado(buscar.trim()), 300);
    return () => clearTimeout(espera);
  }, [buscar]);

  // Consulta actual como texto: cambia con el buscador, los filtros, el
  // interruptor de cancelados y cada vez que se pide recargar.
  const consulta = JSON.stringify({
    ...(filtros || {}),
    buscar: buscarAplicado,
    todos: campoActivo && verInactivas ? true : undefined,
    recargar,
  });

  useEffect(() => {
    let activo = true;
    const { recargar: _ignorar, ...parametros } = JSON.parse(consulta);

    api
      .listar(parametros)
      .then((filas) => {
        if (activo) setResultado({ consulta, filas, error: "" });
      })
      .catch((error) => {
        if (!activo) return;
        manejarError(error, (mensaje) =>
          setResultado((anterior) => ({ ...anterior, consulta, error: mensaje }))
        );
      });

    return () => {
      activo = false;
    };
  }, [api, consulta, manejarError]);

  const { filas, error: errorCarga } = resultado;
  const cargando = resultado.consulta !== consulta;

  // Sin "Mostrar canceladas", la API ya excluye las inactivas; en las tablas
  // que las devuelven siempre (usuarios) se filtran aquí.
  const filasVisibles = useMemo(
    () =>
      campoActivo && !verInactivas
        ? filas.filter((fila) => estaActiva(fila, campoActivo))
        : filas,
    [filas, campoActivo, verInactivas]
  );

  const terminar = (texto) => {
    setAviso({ tipo: "success", texto });
    setRecargar((n) => n + 1);
    alGuardar?.();
  };

  // ----- Formulario -----
  const abrirNuevo = () => {
    const valores = {};
    for (const campo of campos) valores[campo.nombre] = valorVacio(campo);
    setErrorGuardar("");
    setFormulario({ modo: "crear", fila: null, valores, errores: {} });
  };

  const abrirEditar = (fila) => {
    setErrorGuardar("");
    setFormulario({
      modo: "editar",
      fila,
      valores: filaAFormulario(campos, fila),
      errores: {},
    });
  };

  const cambiarValor = (nombre, valor) =>
    setFormulario((actual) => ({
      ...actual,
      valores: { ...actual.valores, [nombre]: valor },
      errores: { ...actual.errores, [nombre]: undefined },
    }));

  const guardar = async (evento) => {
    evento.preventDefault();
    const { modo, fila, valores } = formulario;
    const errores = validar(campos, valores, modo);
    if (Object.keys(errores).length) {
      setFormulario((actual) => ({ ...actual, errores }));
      return;
    }

    setGuardando(true);
    setErrorGuardar("");
    try {
      const datos = formularioADatos(campos, valores, modo);
      if (modo === "crear") await api.crear(datos);
      else await api.actualizar(fila.id, datos);
      setFormulario(null);
      terminar(
        modo === "crear"
          ? `${Singular} ${femenino ? "creada" : "creado"} correctamente.`
          : `Cambios de "${nombreFila(fila)}" guardados.`
      );
    } catch (error) {
      manejarError(error, setErrorGuardar);
    } finally {
      setGuardando(false);
    }
  };

  // ----- Cancelar, reactivar y borrar -----
  const confirmar = async () => {
    const { accion, fila } = confirmacion;
    setGuardando(true);
    setErrorGuardar("");
    try {
      if (accion === "reactivar") {
        await api.actualizar(fila.id, { [campoActivo]: true });
      } else {
        await api.cancelar(fila.id, { definitivo: accion === "borrar" });
      }
      setConfirmacion(null);
      const textos = {
        cancelar: `"${nombreFila(fila)}" quedó ${cancelado}.`,
        reactivar: `"${nombreFila(fila)}" está activ${femenino ? "a" : "o"} de nuevo.`,
        borrar: `"${nombreFila(fila)}" se borró de la base de datos.`,
      };
      terminar(textos[accion]);
    } catch (error) {
      manejarError(error, setErrorGuardar);
    } finally {
      setGuardando(false);
    }
  };

  const textosConfirmacion = confirmacion && {
    cancelar: {
      titulo: `¿Cancelar ${singular}?`,
      texto: `"${nombreFila(confirmacion.fila)}" dejará de mostrarse en la tienda, pero sus datos se conservan. Puedes reactivarl${femenino ? "a" : "o"} después.`,
      boton: "Sí, cancelar",
      peligro: false,
    },
    reactivar: {
      titulo: `¿Reactivar ${singular}?`,
      texto: `"${nombreFila(confirmacion.fila)}" volverá a estar disponible.`,
      boton: "Sí, reactivar",
      peligro: false,
    },
    borrar: {
      titulo: `¿Borrar ${singular} definitivamente?`,
      texto: `"${nombreFila(confirmacion.fila)}" se eliminará de la base de datos y no se podrá recuperar. ${avisoBorrar}`.trim(),
      boton: "Sí, borrar",
      peligro: true,
    },
  }[confirmacion.accion];

  const cerrarConfirmacion = () => {
    if (!guardando) setConfirmacion(null);
  };

  return (
    <section className="crud">
      {/* Barra de herramientas: buscador, filtros y botón "Nuevo" */}
      <div className="crud-toolbar">
        <label className="search-box crud-search">
          <FaMagnifyingGlass className="crud-search-icon" aria-hidden="true" />
          <span className="visually-hidden">Buscar</span>
          <input
            type="search"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder={textoBusqueda}
          />
          {buscar && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setBuscar("")}
              aria-label="Borrar búsqueda"
            >
              <FaXmark aria-hidden="true" />
            </button>
          )}
        </label>

        {herramientas}

        {campoActivo && (
          <Form.Check
            type="switch"
            id={`${idBase}-inactivas`}
            className="crud-switch"
            label={`Mostrar ${femenino ? "canceladas" : "cancelados"}`}
            checked={verInactivas}
            onChange={(e) => setVerInactivas(e.target.checked)}
          />
        )}

        <button type="button" className="crud-button is-primary crud-new" onClick={abrirNuevo}>
          <FaPlus aria-hidden="true" /> {nuevo} {singular}
        </button>
      </div>

      {aviso && (
        <Alert
          variant={aviso.tipo}
          className="crud-alert"
          dismissible
          onClose={() => setAviso(null)}
        >
          {aviso.texto}
        </Alert>
      )}

      {/* Contenido: carga, error, vacío o tabla */}
      {cargando && !filas.length ? (
        <div className="auth-loading" role="status">
          <span className="auth-spinner" aria-hidden="true" />
          Cargando...
        </div>
      ) : errorCarga ? (
        <div className="empty-state" role="alert">
          <h3>No se pudieron cargar los datos</h3>
          <p>{errorCarga}</p>
          <button
            type="button"
            className="crud-button"
            onClick={() => setRecargar((n) => n + 1)}
          >
            Reintentar
          </button>
        </div>
      ) : !filasVisibles.length ? (
        <div className="empty-state">
          <FaMagnifyingGlass className="empty-state-icon" aria-hidden="true" />
          <h3>{buscarAplicado ? "Sin resultados" : `Todavía no hay ${singular}s`}</h3>
          <p>
            {buscarAplicado
              ? `Ningún registro coincide con "${buscarAplicado}".`
              : `Usa "${nuevo} ${singular}" para crear ${un}.`}
          </p>
        </div>
      ) : (
        <>
          <p className="crud-count" aria-live="polite">
            {filasVisibles.length}{" "}
            {filasVisibles.length === 1 ? "registro" : "registros"}
            {cargando && " · actualizando..."}
          </p>
          <Table responsive hover className="crud-table">
            <thead>
              <tr>
                {columnas.map((columna) => (
                  <th key={columna.clave} scope="col" className={columna.className}>
                    {columna.titulo}
                  </th>
                ))}
                {campoActivo && <th scope="col">Estado</th>}
                <th scope="col" className="crud-actions-col">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filasVisibles.map((fila) => {
                const activa = estaActiva(fila, campoActivo);
                return (
                  <tr key={fila.id} className={activa ? undefined : "is-inactive"}>
                    {/* data-label: en celulares cada fila se muestra como una
                        tarjeta y el título de la columna va junto al valor */}
                    {columnas.map((columna, indice) => (
                      <td
                        key={columna.clave}
                        className={`${columna.className || ""}${indice === 0 ? " is-main" : ""}`.trim() || undefined}
                        data-label={columna.titulo}
                      >
                        <div className="crud-cell">
                          {columna.render ? columna.render(fila) : fila[columna.clave] ?? "—"}
                        </div>
                      </td>
                    ))}
                    {campoActivo && (
                      <td data-label="Estado">
                        <span className={`crud-badge ${activa ? "is-on" : "is-off"}`}>
                          {activa ? (femenino ? "Activa" : "Activo") : femenino ? "Cancelada" : "Cancelado"}
                        </span>
                      </td>
                    )}
                    <td className="crud-actions-col">
                      <div className="crud-actions">
                        <button
                          type="button"
                          className="crud-icon-button"
                          onClick={() => abrirEditar(fila)}
                          aria-label={`Editar "${nombreFila(fila)}"`}
                          title="Editar"
                        >
                          <FaPen aria-hidden="true" />
                        </button>
                        {campoActivo &&
                          (activa ? (
                            <button
                              type="button"
                              className="crud-icon-button is-warning"
                              onClick={() => { setErrorGuardar(""); setConfirmacion({ accion: "cancelar", fila }); }}
                              aria-label={`Cancelar "${nombreFila(fila)}"`}
                              title="Cancelar"
                            >
                              <FaBan aria-hidden="true" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="crud-icon-button"
                              onClick={() => { setErrorGuardar(""); setConfirmacion({ accion: "reactivar", fila }); }}
                              aria-label={`Reactivar "${nombreFila(fila)}"`}
                              title="Reactivar"
                            >
                              <FaRotateLeft aria-hidden="true" />
                            </button>
                          ))}
                        {permitirBorrar && (
                          <button
                            type="button"
                            className="crud-icon-button is-danger"
                            onClick={() => { setErrorGuardar(""); setConfirmacion({ accion: "borrar", fila }); }}
                            aria-label={`Borrar definitivamente "${nombreFila(fila)}"`}
                            title="Borrar definitivamente"
                          >
                            <FaTrashCan aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      )}

      {/* Modal con el formulario de crear o editar */}
      <Modal
        show={Boolean(formulario)}
        onHide={() => !guardando && setFormulario(null)}
        centered
        className="crud-modal"
        aria-labelledby={`${idBase}-titulo`}
      >
        {formulario && (
          <Form noValidate onSubmit={guardar}>
            <Modal.Header closeButton={!guardando}>
              <div>
                <span className="section-kicker">
                  {formulario.modo === "crear" ? "NUEVO REGISTRO" : "EDITAR REGISTRO"}
                </span>
                <Modal.Title id={`${idBase}-titulo`}>
                  {formulario.modo === "crear"
                    ? `${nuevo} ${singular}`
                    : nombreFila(formulario.fila)}
                </Modal.Title>
              </div>
            </Modal.Header>
            <Modal.Body>
              {errorGuardar && (
                <Alert variant="danger" className="crud-alert" role="alert">
                  {errorGuardar}
                </Alert>
              )}
              <div className="crud-form-grid">
                {campos
                  .filter((campo) => !(campo.soloCrear && formulario.modo === "editar"))
                  .map((campo) => (
                    <CampoFormulario
                      key={campo.nombre}
                      campo={campo}
                      modo={formulario.modo}
                      valor={formulario.valores[campo.nombre]}
                      error={formulario.errores[campo.nombre]}
                      onChange={cambiarValor}
                      idBase={idBase}
                    />
                  ))}
              </div>
              <p className="crud-note">
                <span aria-hidden="true">*</span> Campo obligatorio
              </p>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="crud-button"
                onClick={() => setFormulario(null)}
                disabled={guardando}
              >
                Cerrar
              </button>
              <button type="submit" className="crud-button is-primary" disabled={guardando}>
                {guardando ? "Guardando..." : formulario.modo === "crear" ? "Crear" : "Guardar cambios"}
              </button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      {/* Modal de confirmación para cancelar, reactivar o borrar */}
      <Modal
        show={Boolean(confirmacion)}
        onHide={cerrarConfirmacion}
        centered
        size="sm"
        className="crud-modal"
        aria-labelledby={`${idBase}-confirmar`}
      >
        {textosConfirmacion && (
          <>
            <Modal.Header closeButton={!guardando}>
              <Modal.Title id={`${idBase}-confirmar`}>{textosConfirmacion.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {errorGuardar && (
                <Alert variant="danger" className="crud-alert" role="alert">
                  {errorGuardar}
                </Alert>
              )}
              <p className="crud-confirm-text">{textosConfirmacion.texto}</p>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="crud-button"
                onClick={cerrarConfirmacion}
                disabled={guardando}
              >
                Volver
              </button>
              <button
                type="button"
                className={`crud-button ${textosConfirmacion.peligro ? "is-danger" : "is-primary"}`}
                onClick={confirmar}
                disabled={guardando}
              >
                {guardando ? "Procesando..." : textosConfirmacion.boton}
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </section>
  );
}

export default CrudTable;
