// Asistente virtual: botón flotante (abajo a la derecha) que abre el chat.
// Cada respuesta muestra los agentes de LangGraph que la prepararon (por
// ejemplo "recepcionista → catálogo → redactor") y, si encontró productos,
// los lista con su botón para agregarlos al carrito.
// La conversación se guarda en sessionStorage para no perderla al cambiar de
// página.
import { useEffect, useRef, useState } from "react";
import { FaCommentMedical, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { enviarMensaje } from "../../api/chat.js";
import { ilustracionDe } from "../../utils/ilustraciones.js";
import BotonAgregar from "../carrito/BotonAgregar.jsx";

const CLAVE = "farmauis.chat";
const BIENVENIDA = {
  rol: "bot",
  texto:
    "¡Hola! Soy el asistente de FarmaUIS. Pregúntame por un producto, tus pedidos, horarios o medios de pago.",
};
const SUGERENCIAS = ["¿Tienen acetaminofén?", "¿Cómo va mi pedido?", "¿Qué medios de pago aceptan?"];

// Nombres cortos de los agentes del grafo (agentes/farmabot/grafo.py)
const NOMBRES = {
  recepcionista: "recepcionista",
  agente_catalogo: "catálogo",
  agente_pedidos: "pedidos",
  agente_faq: "preguntas frecuentes",
  guardia_salud: "guardia de salud",
  redactor: "redactor",
  respaldo: "respaldo sin IA",
};

const COLOR_CATEGORIA = {
  Medicamentos: "blue",
  "Cuidado personal": "mint",
  "Vitaminas y suplementos": "orange",
  "Primeros auxilios": "green",
};

const pesos = (valor) =>
  valor.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

// Producto del chat con la forma que espera BotonAgregar (igual que useCatalog)
const paraCarrito = (p) => ({
  id: p.id,
  name: p.nombre,
  price: p.precio,
  stock: p.stock,
  soldOut: p.stock <= 0,
  requiereFormula: p.requiere_formula,
  ilustracion: ilustracionDe(p.nombre, p.categoria),
  color: COLOR_CATEGORIA[p.categoria] || "green",
});

function leerGuardado() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE));
    return Array.isArray(guardado) && guardado.length ? guardado : [BIENVENIDA];
  } catch {
    return [BIENVENIDA];
  }
}

function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState(leerGuardado);
  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const finRef = useRef(null);
  const entradaRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(mensajes.slice(-30)));
    } catch {
      // sin almacenamiento el chat funciona igual
    }
  }, [mensajes]);

  useEffect(() => {
    if (!abierto) return;
    finRef.current?.scrollIntoView({ block: "end" });
    entradaRef.current?.focus();
  }, [abierto, mensajes, esperando]);

  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (evento) => evento.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const enviar = async (contenido) => {
    const mensaje = contenido.trim();
    if (!mensaje || esperando) return;
    const historial = mensajes
      .filter((m) => m !== BIENVENIDA)
      .slice(-10)
      .map(({ rol, texto: t }) => ({ rol, texto: t }));
    setMensajes((actuales) => [...actuales, { rol: "usuario", texto: mensaje }]);
    setTexto("");
    setEsperando(true);
    try {
      const datos = await enviarMensaje(mensaje, historial);
      setMensajes((actuales) => [
        ...actuales,
        {
          rol: "bot",
          texto: datos.respuesta,
          agentes: datos.agentes || [],
          fuente: datos.fuente,
          productos: datos.productos || [],
        },
      ]);
    } catch (error) {
      setMensajes((actuales) => [...actuales, { rol: "bot", texto: error.message, error: true }]);
    } finally {
      setEsperando(false);
    }
  };

  const alEnviar = (evento) => {
    evento.preventDefault();
    enviar(texto);
  };

  return (
    <div className="chat">
      {abierto && (
        <section className="chat-panel" role="dialog" aria-label="Asistente de FarmaUIS">
          <header className="chat-cabecera">
            <div>
              <h2>Asistente FarmaUIS</h2>
              <p>No reemplaza la consulta médica</p>
            </div>
            <button
              type="button"
              className="chat-cerrar"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el asistente"
            >
              <FaXmark aria-hidden="true" />
            </button>
          </header>

          <ol className="chat-mensajes" aria-live="polite">
            {mensajes.map((m, i) => (
              <li key={i} className={`chat-burbuja es-${m.rol} ${m.error ? "es-error" : ""}`}>
                <p>{m.texto}</p>
                {m.productos?.length > 0 && (
                  <ul className="chat-productos">
                    {m.productos.map((p) => (
                      <li key={p.id}>
                        <span>
                          <strong>{p.nombre}</strong>
                          {pesos(p.precio)}
                          {p.requiere_formula && " · con fórmula"}
                        </span>
                        <BotonAgregar product={paraCarrito(p)} conTexto={false} />
                      </li>
                    ))}
                  </ul>
                )}
                {m.agentes?.length > 0 && (
                  <small className="chat-agentes">
                    {m.agentes.map((a) => NOMBRES[a] || a).join(" → ")}
                    {m.fuente === "ia" ? " · con IA" : " · con reglas"}
                  </small>
                )}
              </li>
            ))}
            {esperando && (
              <li className="chat-burbuja es-bot chat-escribiendo">Los agentes están trabajando…</li>
            )}
            <li ref={finRef} aria-hidden="true" />
          </ol>

          {mensajes.length === 1 && (
            <div className="chat-sugerencias">
              {SUGERENCIAS.map((s) => (
                <button key={s} type="button" onClick={() => enviar(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-formulario" onSubmit={alEnviar}>
            <label htmlFor="chat-entrada" className="visually-hidden">
              Escribe tu pregunta
            </label>
            <input
              id="chat-entrada"
              ref={entradaRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={500}
              placeholder="Escribe tu pregunta…"
              autoComplete="off"
            />
            <button type="submit" disabled={!texto.trim() || esperando} aria-label="Enviar">
              <FaPaperPlane aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-lanzador"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar el asistente" : "Abrir el asistente"}
      >
        {abierto ? <FaXmark aria-hidden="true" /> : <FaCommentMedical aria-hidden="true" />}
      </button>
    </div>
  );
}

export default ChatWidget;
