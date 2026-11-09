// Chatbot (/api/chat).
//   POST /   { mensaje, historial }  ->  { respuesta, fuente, productos }
// Un solo asistente con Google Gemini (GOOGLE_API_KEY en .env). Responde
// preguntas de salud y farmacia y, cuando hace falta, usa dos herramientas
// (function calling) que leen MySQL: buscar productos y ver los pedidos del
// usuario con sesión. Así los precios, el stock y los pedidos nunca los
// inventa el modelo. Sin key, o si Gemini falla, busca en el catálogo.
const express = require('express');
const pool = require('../config/db');
const { HttpError } = require('../lib/http');

const router = express.Router();

const GOOGLE_API_KEY = (process.env.GOOGLE_API_KEY || '').trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const MAX_MENSAJE = 500;
const MAX_HISTORIAL = 10;
const MAX_VUELTAS = 3; // llamadas a herramientas por mensaje

// Límite por sesión para no agotar la cuota gratis de Gemini
const LIMITE_POR_MINUTO = 20;

const INSTRUCCIONES = `Eres el asistente virtual de FarmaUIS, una farmacia en línea de Bucaramanga (Colombia), y orientas en salud y farmacia como lo haría un farmacéutico amable.

Puedes responder con detalle sobre:
- para qué sirve un medicamento, cómo actúa, efectos secundarios frecuentes, contraindicaciones e interacciones conocidas (con otros medicamentos, alcohol o alimentos);
- diferencias entre principios activos, genéricos y de marca, formas farmacéuticas;
- cómo conservar y desechar medicamentos, cómo leer el prospecto;
- síntomas comunes, qué los suele causar, autocuidado y cuándo consultar al médico;
- prevención, vacunas, nutrición, sueño, actividad física y hábitos saludables;
- cuidados especiales en embarazo, lactancia, niños y adultos mayores.

Límites:
- No diagnostiques casos personales ni recetes. No indiques dosis para una persona concreta: remite al prospecto, al médico o al farmacéutico.
- Si el mensaje describe señales de alarma (dolor en el pecho, dificultad para respirar, desmayo, convulsiones, sangrado abundante, intoxicación o sobredosis, signos de ACV, ideas de hacerse daño), lo primero es indicar que llame a la línea 123 o vaya a urgencias; en salud mental también la línea 106.
- Si no estás seguro de algo, dilo.

Sobre la tienda:
- Para precios, disponibilidad o productos usa SIEMPRE la herramienta buscar_productos; nunca inventes productos, precios ni existencias. Si un producto requiere fórmula médica, dilo.
- Para pedidos usa la herramienta mis_pedidos.
- Productos con la etiqueta «Con fórmula» necesitan fórmula médica vigente, como exige la regulación colombiana.
- No se necesita cuenta para ver el catálogo ni armar el carrito; para confirmar el pedido sí hay que iniciar sesión y luego se sigue en «Mis pedidos».
- Medios de pago: tarjetas débito y crédito, transferencias y pago contra entrega en la ciudad.
- Horario: lunes a sábado, de 8:00 a. m. a 8:00 p. m.
- Contacto: Universidad Industrial de Santander, Bucaramanga. Teléfono +57 300 000 0000, correo contacto@farmauis.local.

Estilo: español claro, cálido y directo. Respuestas cortas (hasta unas 8 frases o una lista breve) salvo que pidan más detalle. Texto plano: sin Markdown, sin asteriscos ni almohadillas; para listas usa guiones. Si respondes sobre medicamentos, termina recordando en una frase que es información general y no reemplaza la consulta médica.`;

const HERRAMIENTAS = [
  {
    functionDeclarations: [
      {
        name: 'buscar_productos',
        description:
          'Busca productos activos del catálogo de FarmaUIS por nombre o descripción. Devuelve nombre, categoría, precio en pesos, unidades disponibles y si requiere fórmula.',
        parameters: {
          type: 'OBJECT',
          properties: {
            texto: {
              type: 'STRING',
              description: 'Nombre del producto o principio activo, por ejemplo "ibuprofeno"',
            },
          },
          required: ['texto'],
        },
      },
      {
        name: 'mis_pedidos',
        description: 'Devuelve los últimos pedidos del cliente que inició sesión.',
        parameters: { type: 'OBJECT', properties: {} },
      },
    ],
  },
];

let cliente = null;
async function gemini() {
  if (!GOOGLE_API_KEY) return null;
  if (!cliente) {
    const { GoogleGenAI } = await import('@google/genai');
    cliente = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
  }
  return cliente;
}

function leerPeticion(body) {
  const mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim() : '';
  if (!mensaje) throw new HttpError(400, 'Escribe un mensaje');
  if (mensaje.length > MAX_MENSAJE) {
    throw new HttpError(400, `El mensaje admite máximo ${MAX_MENSAJE} caracteres`);
  }
  const historial = Array.isArray(body.historial)
    ? body.historial
        .filter((t) => t && typeof t.texto === 'string' && ['usuario', 'bot'].includes(t.rol))
        .slice(-MAX_HISTORIAL)
        .map((t) => ({ rol: t.rol, texto: t.texto.slice(0, 1000) }))
    : [];
  return { mensaje, historial };
}

function controlarLimite(req) {
  const ahora = Date.now();
  const usos = (req.session.chatUsos || []).filter((t) => ahora - t < 60000);
  if (usos.length >= LIMITE_POR_MINUTO) {
    throw new HttpError(429, 'Vas muy rápido. Espera un momento y vuelve a escribir.');
  }
  req.session.chatUsos = [...usos, ahora];
}

// ---------- Herramientas (MySQL) ----------

// Palabras que no sirven para buscar productos
const VACIAS = new Set(
  ('para sirve sirven como cuanto cuanta precio precios tienen tiene hay venden ' +
    'puedo puede tomar mezclar donde cual cuales que quiero necesito busco algo ' +
    'tengo esta este estos estas sobre entre bien mucho poco unos unas desde hasta').split(' ')
);

function palabrasDe(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-zñ0-9]+/i)
    .filter((p) => p.length > 3 && !VACIAS.has(p))
    .slice(0, 5);
}

async function buscarProductos(texto) {
  const palabras = palabrasDe(texto);
  if (!palabras.length) return [];
  const condiciones = palabras.map(() => '(p.nombre LIKE ? OR p.descripcion LIKE ?)').join(' OR ');
  const [filas] = await pool.query(
    `SELECT p.id, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.requiere_formula
     FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
     WHERE p.activo = TRUE AND (${condiciones})
     ORDER BY p.nombre LIMIT 6`,
    palabras.flatMap((p) => [`%${p}%`, `%${p}%`])
  );
  return filas.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: Number(p.precio),
    stock: p.stock,
    requiere_formula: Boolean(p.requiere_formula),
  }));
}

async function pedidosDe(usuarioId) {
  const [filas] = await pool.query(
    `SELECT p.id, p.estado, DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
            COALESCE(SUM(d.subtotal), 0) AS total, COALESCE(SUM(d.cantidad), 0) AS unidades
     FROM pedidos p LEFT JOIN detalle_pedidos d ON d.pedido_id = p.id
     WHERE p.usuario_id = ?
     GROUP BY p.id ORDER BY p.creado_en DESC LIMIT 5`,
    [usuarioId]
  );
  return filas.map((f) => ({ ...f, total: Number(f.total), unidades: Number(f.unidades) }));
}

// ---------- Conversación con Gemini ----------

async function responderConGemini(ia, mensaje, historial, usuarioId) {
  const contents = [
    ...historial.map((t) => ({
      role: t.rol === 'usuario' ? 'user' : 'model',
      parts: [{ text: t.texto }],
    })),
    { role: 'user', parts: [{ text: mensaje }] },
  ];
  const productos = new Map();

  for (let vuelta = 0; vuelta <= MAX_VUELTAS; vuelta += 1) {
    const resultado = await ia.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: INSTRUCCIONES,
        // En la última vuelta ya no se ofrecen herramientas: debe responder
        tools: vuelta < MAX_VUELTAS ? HERRAMIENTAS : undefined,
        temperature: 0.4,
        maxOutputTokens: 1200,
      },
    });

    const llamadas = resultado.functionCalls || [];
    if (!llamadas.length) {
      const texto = (resultado.text || '').trim();
      if (!texto) throw new Error('Gemini devolvió una respuesta vacía');
      return { respuesta: texto, productos: [...productos.values()] };
    }

    contents.push(resultado.candidates[0].content);
    const respuestas = [];
    for (const llamada of llamadas) {
      let salida;
      if (llamada.name === 'buscar_productos') {
        const encontrados = await buscarProductos(String(llamada.args?.texto || mensaje));
        encontrados.forEach((p) => productos.set(p.id, p));
        salida = encontrados.length
          ? { productos: encontrados }
          : { productos: [], nota: 'No hay productos con ese nombre en el catálogo.' };
      } else if (llamada.name === 'mis_pedidos') {
        salida = usuarioId
          ? { pedidos: await pedidosDe(usuarioId) }
          : { error: 'El cliente no ha iniciado sesión; debe iniciarla para ver sus pedidos.' };
      } else {
        salida = { error: 'Herramienta desconocida' };
      }
      respuestas.push({ functionResponse: { name: llamada.name, response: salida } });
    }
    contents.push({ role: 'user', parts: respuestas });
  }
  throw new Error('Gemini no terminó de responder');
}

const ALARMA = /dolor (en el |de )?pecho|no puedo respirar|me ahogo|desmay|convuls|sangrado abundante|sobredosis|intoxica|envenena|suicid|quitarme la vida|hacerme dano/;
const AVISO_URGENCIA =
  'Eso puede ser una urgencia: llama ya a la línea 123 o ve al servicio de urgencias más cercano. ' +
  'Si se trata de tu salud mental, también puedes llamar a la línea 106.';

// Respaldo sin IA: avisa ante señales de alarma o busca en el catálogo
async function responderPorReglas(mensaje) {
  const texto = mensaje.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (ALARMA.test(texto)) return { respuesta: AVISO_URGENCIA, productos: [] };
  const productos = await buscarProductos(mensaje);
  if (productos.length) return { respuesta: 'Esto encontré en el catálogo:', productos };
  return {
    respuesta:
      'Ahora mismo no puedo responder preguntas de salud (el asistente con IA no está disponible). ' +
      'Sí puedo buscar productos: escribe el nombre de uno, por ejemplo "acetaminofén".',
    productos: [],
  };
}

router.post('/', async (req, res) => {
  const { mensaje, historial } = leerPeticion(req.body);
  controlarLimite(req);

  const ia = await gemini();
  if (ia) {
    try {
      const respuesta = await responderConGemini(ia, mensaje, historial, req.session.user?.id);
      return res.json({ ...respuesta, fuente: 'ia' });
    } catch (error) {
      console.warn('Gemini no respondió, se usa el catálogo:', error.message);
    }
  }

  const respaldo = await responderPorReglas(mensaje);
  res.json({ ...respaldo, fuente: 'reglas' });
});

module.exports = router;
