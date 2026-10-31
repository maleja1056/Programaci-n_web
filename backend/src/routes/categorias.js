// CRUD de la tabla categorias (/api/categorias).
//   GET    /            lista (pública). ?buscar= filtra por nombre o descripción;
//                       ?todos=true incluye las inactivas (solo administrador).
//   GET    /:id         una categoría (las inactivas solo las ve el administrador).
//   POST   /            crea (administrador).
//   PUT    /:id         modifica (administrador); activa: true la reactiva.
//   DELETE /:id         cancela: activa = FALSE (administrador).
//                       ?definitivo=true la borra; sus productos quedan sin
//                       categoría (ON DELETE SET NULL).
const express = require('express');
const pool = require('../config/db');
const requireAdmin = require('../middleware/requireAdmin');
const { HttpError, leerId, leerCampos, textoBusqueda, esVerdadero } = require('../lib/http');

const router = express.Router();

const ESQUEMA = {
  nombre: { tipo: 'texto', obligatorio: true, max: 100 },
  descripcion: { tipo: 'texto', max: 255, nulo: true },
  activa: { tipo: 'booleano' },
};

const COLUMNAS = `
  c.id, c.nombre, c.descripcion, c.activa, c.creado_en,
  (SELECT COUNT(*) FROM productos p
    WHERE p.categoria_id = c.id AND p.activo = TRUE) AS productos`;

async function buscarCategoria(id, { incluirInactiva = true } = {}) {
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM categorias c
     WHERE c.id = ? ${incluirInactiva ? '' : 'AND c.activa = TRUE'}`,
    [id]
  );
  if (!filas[0]) throw new HttpError(404, 'La categoría no existe');
  return filas[0];
}

router.get('/', async (req, res) => {
  const condiciones = [];
  const params = [];

  if (!(esVerdadero(req.query.todos) && requireAdmin.esAdmin(req))) {
    condiciones.push('c.activa = TRUE');
  }

  const buscar = textoBusqueda(req.query.buscar);
  if (buscar) {
    condiciones.push('(c.nombre LIKE ? OR c.descripcion LIKE ?)');
    params.push(`%${buscar}%`, `%${buscar}%`);
  }

  const [categorias] = await pool.query(
    `SELECT ${COLUMNAS} FROM categorias c
     ${condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''}
     ORDER BY c.nombre ASC`,
    params
  );
  res.json(categorias);
});

router.get('/:id', async (req, res) => {
  const id = leerId(req.params.id);
  res.json(await buscarCategoria(id, { incluirInactiva: requireAdmin.esAdmin(req) }));
});

router.post('/', requireAdmin, async (req, res) => {
  const datos = leerCampos(req.body, ESQUEMA);
  const [resultado] = await pool.query('INSERT INTO categorias SET ?', [datos]);
  res.status(201).json(await buscarCategoria(resultado.insertId));
});

router.put('/:id', requireAdmin, async (req, res) => {
  const id = leerId(req.params.id);
  const datos = leerCampos(req.body, ESQUEMA, { parcial: true });
  await buscarCategoria(id); // 404 si no existe
  await pool.query('UPDATE categorias SET ? WHERE id = ?', [datos, id]);
  res.json(await buscarCategoria(id));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = leerId(req.params.id);
  await buscarCategoria(id);

  if (esVerdadero(req.query.definitivo)) {
    await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Categoría eliminada' });
  }

  await pool.query('UPDATE categorias SET activa = FALSE WHERE id = ?', [id]);
  res.json({ success: true, message: 'Categoría desactivada', categoria: await buscarCategoria(id) });
});

module.exports = router;
