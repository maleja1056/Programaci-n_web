// Subir y bajar archivos (/api/archivos). Requiere sesión.
//   POST   /             sube un archivo (campo "archivo" de un formulario
//                       multipart/form-data) a la carpeta backend/uploads/.
//   GET    /             lista los archivos. ?buscar= filtra por nombre y
//                       ?tipo=texto|imagen|video|audio por tipo.
//   GET    /:nombre      descarga el archivo con su nombre original.
//                       ?ver=true lo muestra en el navegador en lugar de
//                       descargarlo (imágenes, videos, audio y PDF).
//   DELETE /:nombre      borra el archivo: quien lo subió o un administrador.
//
// Los archivos no se guardan en la base de datos: el nombre en el disco
// guarda la fecha, quién lo subió y el nombre original, así:
//   1730440000000-u2-a1b2c3__receta-medica.pdf
// Solo se aceptan las extensiones de TIPOS y como máximo TAMANO_MAXIMO.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const { HttpError, textoBusqueda } = require('../lib/http');

const router = express.Router();
router.use(requireAuth);

const CARPETA = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(CARPETA, { recursive: true });

const TAMANO_MAXIMO = 50 * 1024 * 1024; // 50 MB

// Extensiones permitidas por tipo. No se aceptan .html, .svg, .js ni
// ejecutables, porque podrían ejecutar código al abrirse en el navegador.
const TIPOS = {
  texto: ['txt', 'csv', 'md', 'pdf', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp', 'zip'],
  imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  video: ['mp4', 'webm', 'mov', 'mkv', 'avi'],
  audio: ['mp3', 'wav', 'ogg', 'm4a'],
};
// Tipos que se pueden ver en el navegador con ?ver=true
const SE_PUEDEN_VER = ['imagen', 'video', 'audio'];

const extensionDe = (nombre) => path.extname(nombre).slice(1).toLowerCase();
const tipoDe = (nombre) =>
  Object.keys(TIPOS).find((tipo) => TIPOS[tipo].includes(extensionDe(nombre)));

// fecha-u<id del usuario>-<6 caracteres al azar>__<nombre original saneado>
const FORMATO = /^(\d{13})-u(\d+)-([a-f0-9]{6})__([A-Za-z0-9._-]{1,120})$/;

// Quita tildes, espacios y símbolos del nombre original: "Récipe médico.PDF"
// queda "Recipe-medico.pdf".
function sanearNombre(original) {
  const extension = extensionDe(original);
  const base = path
    .basename(original, path.extname(original))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 100);
  return `${base || 'archivo'}.${extension}`;
}

// multer lee el nombre del archivo como latin1, pero los navegadores lo
// envían en UTF-8: sin esto "Récipe.pdf" llegaría como "RÃ©cipe.pdf".
const nombreOriginal = (file) => Buffer.from(file.originalname, 'latin1').toString('utf8');

const subir = multer({
  storage: multer.diskStorage({
    destination: CARPETA,
    filename: (req, file, cb) => {
      const azar = crypto.randomBytes(3).toString('hex');
      cb(null, `${Date.now()}-u${req.session.user.id}-${azar}__${sanearNombre(nombreOriginal(file))}`);
    },
  }),
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
  fileFilter: (req, file, cb) => {
    if (tipoDe(nombreOriginal(file))) return cb(null, true);
    const permitidas = Object.values(TIPOS).flat().join(', ');
    cb(new HttpError(400, `Tipo de archivo no permitido. Se aceptan: ${permitidas}`));
  },
});

// Datos de un archivo a partir de su nombre en el disco
function describir(nombre, req) {
  const [, fecha, usuarioId, , original] = nombre.match(FORMATO);
  const { size } = fs.statSync(path.join(CARPETA, nombre));
  return {
    nombre,
    original,
    tipo: tipoDe(original),
    tamano: size,
    subido_en: new Date(Number(fecha)).toISOString(),
    usuario_id: Number(usuarioId),
    propio: Number(usuarioId) === req.session.user.id,
  };
}

// Comprueba el :nombre de la URL (evita rutas como ../../.env) y que exista
function archivoDe(nombre) {
  if (!FORMATO.test(nombre) || path.basename(nombre) !== nombre) {
    throw new HttpError(400, 'El nombre del archivo no es válido');
  }
  const ruta = path.join(CARPETA, nombre);
  if (!fs.existsSync(ruta)) throw new HttpError(404, 'El archivo no existe');
  return ruta;
}

// Al enviar el archivo se pasa la carpeta como "root": así el envío no
// depende de la ruta completa del proyecto en el disco.
const OPCIONES_ENVIO = { root: CARPETA, headers: { 'X-Content-Type-Options': 'nosniff' } };

router.post('/', subir.single('archivo'), (req, res) => {
  if (!req.file) {
    throw new HttpError(400, 'Elige un archivo para subir (campo "archivo")');
  }
  res.status(201).json(describir(req.file.filename, req));
});

router.get('/', (req, res) => {
  const buscar = textoBusqueda(req.query.buscar)?.toLowerCase();
  const tipo = req.query.tipo;
  if (tipo && !TIPOS[tipo]) {
    throw new HttpError(400, `El tipo debe ser uno de: ${Object.keys(TIPOS).join(', ')}`);
  }

  const archivos = fs
    .readdirSync(CARPETA)
    .filter((nombre) => FORMATO.test(nombre))
    .map((nombre) => describir(nombre, req))
    .filter((archivo) => !tipo || archivo.tipo === tipo)
    .filter((archivo) => !buscar || archivo.original.toLowerCase().includes(buscar))
    .sort((a, b) => b.subido_en.localeCompare(a.subido_en));

  res.json(archivos);
});

router.get('/:nombre', (req, res) => {
  archivoDe(req.params.nombre);
  const { nombre, original, tipo } = describir(req.params.nombre, req);

  if (req.query.ver === 'true' && SE_PUEDEN_VER.includes(tipo)) {
    return res.sendFile(nombre, OPCIONES_ENVIO);
  }
  res.download(nombre, original, OPCIONES_ENVIO);
});

router.delete('/:nombre', (req, res) => {
  const ruta = archivoDe(req.params.nombre);
  const archivo = describir(req.params.nombre, req);
  if (!archivo.propio && !requireAdmin.esAdmin(req)) {
    throw new HttpError(403, 'Solo quien subió el archivo o un administrador puede borrarlo');
  }
  fs.unlinkSync(ruta);
  res.json({ success: true, message: `Archivo "${archivo.original}" borrado` });
});

module.exports = router;
