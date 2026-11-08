// Chatbot (/api/chat).
//   POST /   { mensaje, historial }  ->  { respuesta, fuente, agentes, productos }
// Reenvía el mensaje al servicio de agentes de LangGraph (carpeta agentes/,
// AGENTES_URL en .env) junto con el id del usuario si inició sesión. Si ese
// servicio está apagado o tarda, responde con reglas sencillas sobre el
// catálogo para que el chat nunca se quede sin respuesta.
const express = require('express');
const pool = require('../config/db');
const { HttpError } = require('../lib/http');

const router = express.Router();

const AGENTES_URL = process.env.AGENTES_URL || 'http://127.0.0.1:8123';
const ESPERA_MS = 30000;
const MAX_MENSAJE = 500;
const MAX_HISTORIAL = 10;

// Límite por sesión para no agotar la cuota gratis de la IA
const LIMITE_POR_MINUTO = 20;

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

// Respaldo sin agentes: busca en el catálogo las palabras del mensaje
async function responderPorReglas(mensaje) {
  const palabras = mensaje
    .toLowerCase()
    .split(/[^a-záéíóúñü0-9]+/i)
    .filter((p) => p.length > 3)
    .slice(0, 5);

  if (palabras.length) {
    const condiciones = palabras.map(() => '(p.nombre LIKE ? OR p.descripcion LIKE ?)').join(' OR ');
    const [productos] = await pool.query(
      `SELECT p.id, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.requiere_formula
       FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE p.activo = TRUE AND (${condiciones})
       ORDER BY p.nombre LIMIT 6`,
      palabras.flatMap((p) => [`%${p}%`, `%${p}%`])
    );
    if (productos.length) {
      return {
        respuesta: 'Esto encontré en el catálogo:',
        productos: productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: Number(p.precio),
          stock: p.stock,
          requiere_formula: Boolean(p.requiere_formula),
        })),
      };
    }
  }

  return {
    respuesta:
      'Por ahora solo puedo buscar productos del catálogo. Escribe el nombre de un producto, ' +
      'por ejemplo "acetaminofén", o revisa las preguntas frecuentes de la portada.',
    productos: [],
  };
}

router.post('/', async (req, res) => {
  const { mensaje, historial } = leerPeticion(req.body);
  controlarLimite(req);

  try {
    const respuesta = await fetch(`${AGENTES_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje, historial, usuario_id: req.session.user?.id ?? null }),
      signal: AbortSignal.timeout(ESPERA_MS),
    });
    if (!respuesta.ok) throw new Error(`el servicio de agentes respondió ${respuesta.status}`);
    return res.json(await respuesta.json());
  } catch (error) {
    console.warn('Chat sin servicio de agentes, se responde por reglas:', error.message);
  }

  const respaldo = await responderPorReglas(mensaje);
  res.json({ ...respaldo, fuente: 'reglas', agentes: ['respaldo'] });
});

module.exports = router;
