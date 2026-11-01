// Página privada /archivos: subir archivos al servidor y bajarlos.
// Cualquier usuario con sesión puede subir texto, imágenes, videos o audio
// (máximo 50 MB), ver la lista, buscar, ver en el navegador las imágenes,
// videos y audios, y descargar. Cada uno puede borrar lo que subió; el
// administrador puede borrar cualquier archivo.
// Las peticiones están en api/archivos.js y el backend en routes/archivos.js.
import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import Table from "react-bootstrap/Table";
import {
  FaDownload,
  FaEye,
  FaFileAudio,
  FaFileImage,
  FaFileLines,
  FaFileVideo,
  FaMagnifyingGlass,
  FaTrashCan,
  FaUpload,
  FaXmark,
} from "react-icons/fa6";
import {
  ACEPTA,
  EXTENSIONES,
  TAMANO_MAXIMO,
  borrarArchivo,
  formatTamano,
  listarArchivos,
  subirArchivo,
  urlDescarga,
  urlVer,
} from "../api/archivos.js";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import { useAuth } from "../context/auth-context.js";
import { formatFecha } from "../utils/format.js";

const TIPOS = {
  texto: { texto: "Documento", Icono: FaFileLines },
  imagen: { texto: "Imagen", Icono: FaFileImage },
  video: { texto: "Video", Icono: FaFileVideo },
  audio: { texto: "Audio", Icono: FaFileAudio },
};
const SE_PUEDEN_VER = ["imagen", "video", "audio"];

// Revisa el archivo antes de enviarlo (el servidor lo vuelve a revisar)
function errorDeArchivo(archivo) {
  const extension = archivo.name.split(".").pop().toLowerCase();
  if (!Object.values(EXTENSIONES).flat().includes(extension)) {
    return "Ese tipo de archivo no se acepta. Sube texto, imágenes, videos o audio.";
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return `El archivo pesa ${formatTamano(archivo.size)}; el máximo es 50 MB.`;
  }
  return "";
}

function ArchivosPage() {
  const { user, handleUnauthorized } = useAuth();
  const esAdmin = user.rol === "administrador";

  // Lista
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState("");
  const [buscar, setBuscar] = useState("");
  const [buscarAplicado, setBuscarAplicado] = useState("");
  const [tipo, setTipo] = useState("");
  const [recargar, setRecargar] = useState(0);

  // Subida
  const [elegido, setElegido] = useState(null);
  const [claveInput, setClaveInput] = useState(0); // para vaciar el <input type=file>
  const [progreso, setProgreso] = useState(null); // null = no se está subiendo
  const [aviso, setAviso] = useState(null); // { tipo, texto }

  // Ver y borrar
  const [viendo, setViendo] = useState(null);
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState("");

  const manejarError = useCallback(
    (error, mostrar) => {
      if (error.status === 401) handleUnauthorized();
      else mostrar(error.message);
    },
    [handleUnauthorized]
  );

  // El buscador se aplica 300 ms después de dejar de escribir
  useEffect(() => {
    const espera = setTimeout(() => setBuscarAplicado(buscar.trim()), 300);
    return () => clearTimeout(espera);
  }, [buscar]);

  useEffect(() => {
    let activo = true;
    listarArchivos({ buscar: buscarAplicado, tipo })
      .then((datos) => {
        if (!activo) return;
        setArchivos(datos);
        setErrorLista("");
      })
      .catch((error) => activo && manejarError(error, setErrorLista))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [buscarAplicado, tipo, recargar, manejarError]);

  const elegir = (evento) => {
    const archivo = evento.target.files[0] || null;
    setAviso(null);
    if (archivo) {
      const error = errorDeArchivo(archivo);
      if (error) {
        setAviso({ tipo: "danger", texto: error });
        setElegido(null);
        setClaveInput((n) => n + 1);
        return;
      }
    }
    setElegido(archivo);
  };

  const subir = async (evento) => {
    evento.preventDefault();
    if (!elegido) {
      setAviso({ tipo: "danger", texto: "Elige un archivo para subir." });
      return;
    }
    setProgreso(0);
    setAviso(null);
    try {
      const subido = await subirArchivo(elegido, setProgreso);
      setAviso({ tipo: "success", texto: `"${subido.original}" se subió al servidor.` });
      setElegido(null);
      setClaveInput((n) => n + 1);
      setRecargar((n) => n + 1);
    } catch (error) {
      manejarError(error, (texto) => setAviso({ tipo: "danger", texto }));
    } finally {
      setProgreso(null);
    }
  };

  const confirmarBorrado = async () => {
    setBorrando(true);
    setErrorBorrar("");
    try {
      await borrarArchivo(porBorrar.nombre);
      setAviso({ tipo: "success", texto: `"${porBorrar.original}" se borró del servidor.` });
      setPorBorrar(null);
      setRecargar((n) => n + 1);
    } catch (error) {
      manejarError(error, setErrorBorrar);
    } finally {
      setBorrando(false);
    }
  };

  const subiendo = progreso !== null;

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="panel-page">
        <div className="panel-heading">
          <span className="section-kicker">ARCHIVOS</span>
          <h1>Subir y descargar archivos</h1>
          <p>
            Guarda en el servidor documentos, fórmulas médicas escaneadas,
            imágenes, videos o audio, y descárgalos cuando los necesites.
          </p>
        </div>

        {/* Formulario de subida */}
        <Form className="archivos-subir" onSubmit={subir} noValidate>
          <Form.Group controlId="archivo-elegido" className="archivos-subir-campo">
            <Form.Label>Archivo</Form.Label>
            <Form.Control
              key={claveInput}
              type="file"
              accept={ACEPTA}
              onChange={elegir}
              disabled={subiendo}
              aria-describedby="archivo-ayuda"
            />
            <Form.Text id="archivo-ayuda">
              Texto (PDF, Word, Excel, TXT...), imágenes, videos o audio. Máximo 50 MB.
            </Form.Text>
          </Form.Group>
          <button type="submit" className="crud-button is-primary" disabled={subiendo || !elegido}>
            <FaUpload aria-hidden="true" /> {subiendo ? "Subiendo..." : "Subir archivo"}
          </button>
          {elegido && !subiendo && (
            <p className="archivos-elegido">
              {elegido.name} · {formatTamano(elegido.size)}
            </p>
          )}
          {subiendo && (
            <ProgressBar
              className="archivos-progreso"
              now={progreso}
              label={`${progreso} %`}
              aria-label="Progreso de la subida"
            />
          )}
        </Form>

        {aviso && (
          <Alert
            variant={aviso.tipo}
            className="crud-alert"
            dismissible
            onClose={() => setAviso(null)}
            role={aviso.tipo === "danger" ? "alert" : "status"}
          >
            {aviso.texto}
          </Alert>
        )}

        {/* Buscador y filtro */}
        <div className="crud-toolbar archivos-toolbar">
          <label className="search-box crud-search">
            <FaMagnifyingGlass className="crud-search-icon" aria-hidden="true" />
            <span className="visually-hidden">Buscar</span>
            <input
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar archivo por nombre..."
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
          <Form.Select
            aria-label="Filtrar por tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS).map(([valor, { texto }]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </Form.Select>
        </div>

        {/* Lista */}
        {cargando ? (
          <div className="auth-loading" role="status">
            <span className="auth-spinner" aria-hidden="true" />
            Cargando...
          </div>
        ) : errorLista ? (
          <div className="empty-state" role="alert">
            <h3>No se pudo cargar la lista</h3>
            <p>{errorLista}</p>
            <button type="button" className="crud-button" onClick={() => setRecargar((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        ) : !archivos.length ? (
          <div className="empty-state">
            <FaUpload className="empty-state-icon" aria-hidden="true" />
            <h3>{buscarAplicado || tipo ? "Sin resultados" : "Todavía no hay archivos"}</h3>
            <p>
              {buscarAplicado || tipo
                ? "Ningún archivo coincide con la búsqueda."
                : "Sube el primero con el formulario de arriba."}
            </p>
          </div>
        ) : (
          <>
            <p className="crud-count" aria-live="polite">
              {archivos.length} {archivos.length === 1 ? "archivo" : "archivos"}
            </p>
            <Table responsive hover className="crud-table">
              <thead>
                <tr>
                  <th scope="col">Archivo</th>
                  <th scope="col">Tipo</th>
                  <th scope="col" className="crud-cell-number">Tamaño</th>
                  <th scope="col" className="crud-actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {archivos.map((archivo) => {
                  const { texto, Icono } = TIPOS[archivo.tipo] || TIPOS.texto;
                  return (
                    <tr key={archivo.nombre}>
                      <td className="is-main" data-label="Archivo">
                        <div className="crud-cell archivos-nombre">
                          <Icono className="archivos-icono" aria-hidden="true" />
                          <span>
                            <span className="crud-cell-strong">{archivo.original}</span>
                            <span className="crud-cell-sub">
                              {formatFecha(archivo.subido_en)}
                              {archivo.propio ? " · subido por ti" : ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td data-label="Tipo">
                        <div className="crud-cell">{texto}</div>
                      </td>
                      <td className="crud-cell-number" data-label="Tamaño">
                        <div className="crud-cell">{formatTamano(archivo.tamano)}</div>
                      </td>
                      <td className="crud-actions-col">
                        <div className="crud-actions">
                          {SE_PUEDEN_VER.includes(archivo.tipo) && (
                            <button
                              type="button"
                              className="crud-icon-button"
                              onClick={() => setViendo(archivo)}
                              aria-label={`Ver "${archivo.original}"`}
                              title="Ver"
                            >
                              <FaEye aria-hidden="true" />
                            </button>
                          )}
                          <a
                            className="crud-icon-button"
                            href={urlDescarga(archivo.nombre)}
                            download={archivo.original}
                            aria-label={`Descargar "${archivo.original}"`}
                            title="Descargar"
                          >
                            <FaDownload aria-hidden="true" />
                          </a>
                          {(archivo.propio || esAdmin) && (
                            <button
                              type="button"
                              className="crud-icon-button is-danger"
                              onClick={() => {
                                setErrorBorrar("");
                                setPorBorrar(archivo);
                              }}
                              aria-label={`Borrar "${archivo.original}"`}
                              title="Borrar"
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
      </main>

      {/* Ver una imagen, video o audio sin descargarlo */}
      <Modal
        show={Boolean(viendo)}
        onHide={() => setViendo(null)}
        centered
        size="lg"
        className="crud-modal"
        aria-labelledby="archivo-viendo"
      >
        {viendo && (
          <>
            <Modal.Header closeButton>
              <Modal.Title id="archivo-viendo">{viendo.original}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="archivos-visor">
              {viendo.tipo === "imagen" && <img src={urlVer(viendo.nombre)} alt={viendo.original} />}
              {viendo.tipo === "video" && (
                <video src={urlVer(viendo.nombre)} controls autoPlay>
                  Tu navegador no puede reproducir este video.
                </video>
              )}
              {viendo.tipo === "audio" && (
                <audio src={urlVer(viendo.nombre)} controls autoPlay>
                  Tu navegador no puede reproducir este audio.
                </audio>
              )}
            </Modal.Body>
            <Modal.Footer>
              <a className="crud-button" href={urlDescarga(viendo.nombre)} download={viendo.original}>
                <FaDownload aria-hidden="true" /> Descargar
              </a>
              <button type="button" className="crud-button is-primary" onClick={() => setViendo(null)}>
                Cerrar
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Confirmación para borrar */}
      <Modal
        show={Boolean(porBorrar)}
        onHide={() => !borrando && setPorBorrar(null)}
        centered
        size="sm"
        className="crud-modal"
        aria-labelledby="archivo-borrar"
      >
        {porBorrar && (
          <>
            <Modal.Header closeButton={!borrando}>
              <Modal.Title id="archivo-borrar">¿Borrar archivo?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {errorBorrar && (
                <Alert variant="danger" className="crud-alert" role="alert">
                  {errorBorrar}
                </Alert>
              )}
              <p>"{porBorrar.original}" se borrará del servidor y no se podrá recuperar.</p>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="crud-button"
                onClick={() => setPorBorrar(null)}
                disabled={borrando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="crud-button is-danger"
                onClick={confirmarBorrado}
                disabled={borrando}
              >
                {borrando ? "Borrando..." : "Sí, borrar"}
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <SiteFooter />
    </div>
  );
}

export default ArchivosPage;
