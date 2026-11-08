# Grafo de agentes del chatbot de FarmaUIS (LangGraph).
#
#   START -> recepcionista -+-> agente_catalogo -+
#                           +-> agente_pedidos  -+
#                           +-> agente_faq      -+-> redactor -> END
#                           +-> guardia_salud   -+
#
# - recepcionista: decide qué agente atiende el mensaje.
# - agente_catalogo: busca productos, precios, stock y categorías en MySQL.
# - agente_pedidos: consulta los pedidos del usuario que inició sesión.
# - agente_faq: responde con las preguntas frecuentes del sitio.
# - guardia_salud: si el mensaje habla de síntomas o dosis, no diagnostica y
#   remite al médico o farmacéutico.
# - redactor: convierte los datos reunidos en una respuesta corta en español.
#
# Con GOOGLE_API_KEY en .env, el recepcionista y el redactor usan Gemini. Sin
# key (o si Gemini falla o se acaba el límite gratis) usan reglas, así el grafo
# siempre responde. Los datos (productos, precios, pedidos) salen siempre de
# MySQL, nunca del modelo.
import logging
import operator
from typing import Annotated, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from . import herramientas
from .configuracion import GEMINI_MODEL, GOOGLE_API_KEY
from .herramientas import normalizar

log = logging.getLogger("farmabot")

Intencion = Literal["catalogo", "pedidos", "faq", "salud"]


class Estado(TypedDict, total=False):
    mensaje: str  # lo que escribió el usuario
    historial: list[dict]  # turnos anteriores: [{"rol": "usuario"|"bot", "texto": ...}]
    usuario_id: int | None  # id del usuario con sesión (None si no inició sesión)
    intencion: Intencion
    hechos: str  # datos que reunió el agente especialista (para el redactor)
    productos: list[dict]  # productos encontrados (el chat los muestra con botón)
    respuesta: str
    fuente: Literal["ia", "reglas"]
    # Cada nodo agrega su nombre: así se ve qué agentes trabajaron
    recorrido: Annotated[list[str], operator.add]


# ---------- Modelo (Gemini) ----------

_modelo = None


def modelo():
    """Cliente de Gemini, o None si no hay API key."""
    global _modelo
    if not GOOGLE_API_KEY:
        return None
    if _modelo is None:
        from langchain_google_genai import ChatGoogleGenerativeAI

        _modelo = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3,
            timeout=15,
            max_retries=1,
        )
    return _modelo


def preguntar_al_modelo(instrucciones: str, texto: str) -> str | None:
    """Respuesta de Gemini, o None si no hay key o falla (se usan reglas)."""
    llm = modelo()
    if llm is None:
        return None
    try:
        respuesta = llm.invoke([("system", instrucciones), ("human", texto)])
        contenido = respuesta.content
        if isinstance(contenido, list):  # algunos modelos devuelven partes
            contenido = "".join(
                p.get("text", "") if isinstance(p, dict) else str(p) for p in contenido
            )
        return contenido.strip() or None
    except Exception as error:  # límite gratis, red, key inválida...
        log.warning("Gemini no respondió, se usan reglas: %s", error)
        return None


# ---------- Reglas por palabras clave ----------

SALUD = (
    "duele", "dolor", "fiebre", "sintoma", "dosis", "cuantas pastillas",
    "cada cuanto", "me siento", "enfermo", "enferma", "embarazada", "alergia",
    "mareo", "vomito", "diarrea", "tos", "gripa", "gripe", "infeccion",
    "que me tomo", "que tomo", "que puedo tomar", "me recomiendas", "receta",
    "diagnostico", "presion", "nino de", "bebe",
)
PEDIDOS = ("pedido", "pedidos", "compra", "compras", "orden", "envio de mi", "mi envio")
FAQ = (
    "horario", "abren", "cierran", "pago", "pagar", "tarjeta", "transferencia",
    "contra entrega", "cuenta", "registr", "formula", "como encuentro",
    "como compro", "como busco", "contacto", "telefono", "correo", "direccion",
    "ubicacion", "donde quedan", "hola", "buenas", "gracias", "ayuda",
)


def _contiene(texto: str, palabras) -> bool:
    return any(p in texto for p in palabras)


def intencion_por_reglas(mensaje: str) -> Intencion:
    texto = normalizar(mensaje)
    if _contiene(texto, SALUD):
        return "salud"
    if _contiene(texto, PEDIDOS):
        return "pedidos"
    if herramientas.palabras_clave(mensaje) and not _contiene(texto, FAQ):
        return "catalogo"
    if _contiene(texto, ("categoria", "categorias", "que venden", "catalogo")):
        return "catalogo"
    return "faq"


# ---------- Nodos (agentes) ----------


def recepcionista(estado: Estado) -> Estado:
    mensaje = estado["mensaje"]
    # La salud siempre se detecta con reglas: es la parte que no debe fallar
    intencion = intencion_por_reglas(mensaje)
    if intencion != "salud":
        decision = preguntar_al_modelo(
            "Eres el recepcionista del chat de FarmaUIS, una farmacia en línea. "
            "Clasifica el mensaje del cliente en UNA palabra:\n"
            "catalogo = busca productos, precios, disponibilidad o categorías\n"
            "pedidos = pregunta por sus pedidos o compras\n"
            "salud = describe síntomas o pide qué tomar o dosis\n"
            "faq = horarios, pagos, cuenta, fórmula médica, saludos u otra cosa\n"
            "Responde solo la palabra.",
            mensaje,
        )
        if decision:
            palabra = normalizar(decision).strip(" .\n*`")
            if palabra in ("catalogo", "pedidos", "faq", "salud"):
                intencion = palabra
    return {"intencion": intencion, "recorrido": ["recepcionista"]}


def _pesos(valor: float) -> str:
    return "$" + f"{valor:,.0f}".replace(",", ".")


def agente_catalogo(estado: Estado) -> Estado:
    productos = herramientas.buscar_productos(estado["mensaje"])
    if productos:
        lineas = []
        for p in productos:
            disponibilidad = f"{p['stock']} disponibles" if p["stock"] > 0 else "agotado"
            formula = ", requiere fórmula médica" if p["requiere_formula"] else ""
            lineas.append(
                f"- {p['nombre']} ({p['categoria']}): {_pesos(p['precio'])}, {disponibilidad}{formula}"
            )
        hechos = "Productos encontrados en el catálogo:\n" + "\n".join(lineas)
    else:
        hechos = (
            "No se encontraron productos para esa búsqueda. Categorías disponibles: "
            + ", ".join(herramientas.categorias())
            + "."
        )
    return {"hechos": hechos, "productos": productos, "recorrido": ["agente_catalogo"]}


def agente_pedidos(estado: Estado) -> Estado:
    usuario_id = estado.get("usuario_id")
    if not usuario_id:
        hechos = (
            "Para ver tus pedidos primero inicia sesión; después los encuentras "
            "en «Mis pedidos»."
        )
    else:
        pedidos = herramientas.pedidos_de_usuario(usuario_id)
        if pedidos:
            hechos = "Tus últimos pedidos:\n" + "\n".join(
                f"- Pedido #{p['id']} del {p['fecha']}: estado «{p['estado']}», "
                f"{p['unidades']} unidades, total {_pesos(p['total'])}"
                for p in pedidos
            )
        else:
            hechos = "Todavía no tienes pedidos. Puedes armar uno desde el catálogo."
    return {"hechos": hechos, "productos": [], "recorrido": ["agente_pedidos"]}


# Mismas preguntas frecuentes de frontend/src/data/preguntas.js y sitio.js
PREGUNTAS = {
    "buscar": "Usa el buscador del catálogo o elige una categoría. Cada tarjeta muestra el precio, las unidades disponibles y si el producto requiere fórmula médica. Con el botón del carrito lo agregas a tu compra.",
    "formula": "Los productos con la etiqueta «Con fórmula» necesitan una fórmula médica vigente para entregarlos, como lo exige la regulación colombiana.",
    "cuenta": "No necesitas cuenta para ver el catálogo ni armar tu carrito. Para confirmar el pedido sí debes iniciar sesión; después lo sigues en «Mis pedidos».",
    "pagos": "Aceptamos tarjetas débito y crédito, transferencias y pago contra entrega en la ciudad.",
    "horario": "Atendemos de lunes a sábado, de 8:00 a. m. a 8:00 p. m. Fuera de ese horario puedes escribirnos por redes sociales.",
    "contacto": "Estamos en la Universidad Industrial de Santander, Bucaramanga. Teléfono +57 300 000 0000, correo contacto@farmauis.local.",
}
TEMAS_FAQ = {
    "formula": ("formula", "receta"),
    "pagos": ("pago", "pagar", "tarjeta", "transferencia", "contra entrega"),
    "horario": ("horario", "abren", "cierran", "hora"),
    "cuenta": ("cuenta", "registr", "iniciar sesion", "login"),
    "contacto": ("contacto", "telefono", "correo", "direccion", "ubicacion", "donde quedan"),
    "buscar": ("como encuentro", "como compro", "como busco", "buscar"),
}


def agente_faq(estado: Estado) -> Estado:
    texto = normalizar(estado["mensaje"])
    temas = [tema for tema, palabras in TEMAS_FAQ.items() if _contiene(texto, palabras)]
    if temas:
        hechos = "\n".join(PREGUNTAS[t] for t in temas)
    else:
        hechos = (
            "Saludo o pregunta general. El asistente puede ayudar a buscar productos "
            "y precios, consultar pedidos, y responder sobre horarios, pagos y "
            "fórmulas médicas.\nInformación del sitio:\n"
            + "\n".join(PREGUNTAS.values())
        )
    return {"hechos": hechos, "productos": [], "recorrido": ["agente_faq"]}


AVISO_SALUD = (
    "No puedo darte diagnósticos ni indicarte qué medicamento o dosis tomar. "
    "Para eso consulta a un médico o a un farmacéutico. Si es una urgencia, "
    "llama a la línea 123 o acude a un servicio de urgencias. "
    "Sí puedo ayudarte a buscar un producto por su nombre o ver si está disponible."
)


def guardia_salud(estado: Estado) -> Estado:
    return {"hechos": AVISO_SALUD, "productos": [], "recorrido": ["guardia_salud"]}


def redactor(estado: Estado) -> Estado:
    hechos = estado.get("hechos", "")
    if estado.get("intencion") == "salud":
        # El aviso de salud se entrega tal cual, sin que el modelo lo cambie
        return {"respuesta": hechos, "fuente": "reglas", "recorrido": ["redactor"]}

    historial = "\n".join(
        f"{'Cliente' if t.get('rol') == 'usuario' else 'Asistente'}: {t.get('texto', '')}"
        for t in (estado.get("historial") or [])[-6:]
    )
    texto = preguntar_al_modelo(
        "Eres el asistente virtual de FarmaUIS, una farmacia en línea de Bucaramanga. "
        "Responde en español, amable y en máximo 4 frases o una lista corta. "
        "Usa SOLO los datos de la sección DATOS: no inventes productos, precios, "
        "existencias ni pedidos. Si un producto requiere fórmula médica, dilo. "
        "Nunca diagnostiques ni recomiendes medicamentos o dosis; ante síntomas, "
        "sugiere consultar a un médico o farmacéutico. No uses Markdown con asteriscos.",
        f"CONVERSACIÓN PREVIA:\n{historial or '(ninguna)'}\n\n"
        f"MENSAJE DEL CLIENTE:\n{estado['mensaje']}\n\nDATOS:\n{hechos}",
    )
    if texto:
        return {"respuesta": texto, "fuente": "ia", "recorrido": ["redactor"]}
    return {"respuesta": _respuesta_por_reglas(estado), "fuente": "reglas", "recorrido": ["redactor"]}


def _respuesta_por_reglas(estado: Estado) -> str:
    hechos = estado.get("hechos", "")
    if estado.get("intencion") == "catalogo" and estado.get("productos"):
        return hechos.replace("Productos encontrados en el catálogo:", "Esto encontré en el catálogo:")
    if estado.get("intencion") == "faq" and hechos.startswith("Saludo"):
        return (
            "¡Hola! Soy el asistente de FarmaUIS. Puedo buscar productos y precios, "
            "contarte cómo van tus pedidos y resolver dudas sobre horarios, pagos "
            "y fórmulas médicas. ¿En qué te ayudo?"
        )
    return hechos


# ---------- Grafo ----------


def elegir_agente(estado: Estado) -> str:
    return {
        "catalogo": "agente_catalogo",
        "pedidos": "agente_pedidos",
        "faq": "agente_faq",
        "salud": "guardia_salud",
    }[estado["intencion"]]


def construir_grafo():
    g = StateGraph(Estado)
    g.add_node("recepcionista", recepcionista)
    g.add_node("agente_catalogo", agente_catalogo)
    g.add_node("agente_pedidos", agente_pedidos)
    g.add_node("agente_faq", agente_faq)
    g.add_node("guardia_salud", guardia_salud)
    g.add_node("redactor", redactor)

    g.add_edge(START, "recepcionista")
    g.add_conditional_edges(
        "recepcionista",
        elegir_agente,
        ["agente_catalogo", "agente_pedidos", "agente_faq", "guardia_salud"],
    )
    for agente in ("agente_catalogo", "agente_pedidos", "agente_faq", "guardia_salud"):
        g.add_edge(agente, "redactor")
    g.add_edge("redactor", END)
    return g.compile()


# LangGraph Studio (langgraph.json) carga esta variable
grafo = construir_grafo()
