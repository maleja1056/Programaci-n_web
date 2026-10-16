
const crypto = require('crypto');
const session = require('express-session');
require('./db'); // carga el archivo .env de la raíz del proyecto

const SESSION_COOKIE_NAME = 'farmauis.sid';

let secret = process.env.SESSION_SECRET;

if (!secret) {
  // Sin SESSION_SECRET el servidor funciona, pero las sesiones se pierden
  // cada vez que se reinicia. Defínelo en el archivo .env.
  secret = crypto.randomBytes(32).toString('hex');
  console.warn(
    'SESSION_SECRET no está definido en .env: se usará un secreto temporal.'
  );
}

// Proyecto académico: las sesiones se guardan en memoria (MemoryStore), por lo
// que se pierden al reiniciar el backend. En producción habría que usar un
// almacén persistente (MySQL, Redis) y HTTPS.
const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2, // 2 horas
  },
});

module.exports = { sessionMiddleware, SESSION_COOKIE_NAME };
