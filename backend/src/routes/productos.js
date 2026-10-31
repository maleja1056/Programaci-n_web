// CRUD de la tabla productos (/api/productos).
//   GET    /            lista (pública) con el nombre de la categoría.
//                       Filtros: ?categoria=<id>, ?buscar=<texto en nombre o
//                       descripción>, ?todos=true incluye los inactivos
//                       (solo administrador).
//   GET    /:id         un producto (los inactivos solo los ve el administrador).
//   POST   /            crea (administrador).
//   PUT    /:id         modifica (administrador); activo: true lo reactiva.
//   DELETE /:id         cancela: activo = FALSE (administrador).
//                       ?definitivo=true lo borra, solo si no está en ningún
//                       pedido (si está, responde 409).
// Las consultas usan "?" (parámetros) para evitar inyección SQL.
const express = require('express');
const pool = require('../config/db');
const requireAdmin = require('../middleware/requireAdmin');
const { HttpError, leerId, leerCampos, textoBusqueda, esVerdadero } = require('../lib/http');

const router = express.Router();

const ESQUEMA = {
  categoria_id: { tipo: 'entero', min: 1, nulo: true, etiqueta: 'categoría' },
  nombre: { tipo: 'texto', obligatorio: true, max: 150 },
  descripcion: { tipo: 'texto', max: 2000, nulo: true },
  precio: { tipo: 'decimal', obligatorio: true, min: 0, max: 9999999999 },
  stock: { tipo: 'entero', min: 0, max: 1000000 },
  imagen_url: { tipo: 'texto', max: 500, nulo: true, etiqueta: 'imagen' },
  requiere_formula: { tipo: 'booleano', etiqueta: 'requiere fórmula' },
  activo: { tipo: 'booleano' },
};

const SELECT = `
  SELECT
    p.id, p.categoria_id, c.nombre AS categoria, p.nombre, p.descripcion,
    p.precio, p.stock, p.imagen_url, p.requiere_formula, p.activo,
    p.creado_en, p.actualizado_en
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id`;

async function buscarProducto(id, { incluirInactivo = true } = {}) {
  const [filas] = await pool.query(
    `${SELECT} WHERE p.id = ? ${incluirInactivo ? '' : 'AND p.activo = TRUE'}`,
    [id]
  );
  if (!filas[0]) throw new HttpError(404, 'El producto no existe');
  return filas[0];
}

router.get('/', async (req, res) => {
  const condiciones = [];
  const params = [];

  if (!(esVerdadero(req.query.todos) && requireAdmin.esAdmin(req))) {
    condiciones.push('p.activo = TRUE');
  }

  if (req.query.categoria) {
    condiciones.push('p.categoria_id = ?');
    params.push(leerId(req.query.categoria, 'id de la categoría'));
  }

  const buscar = textoBusqueda(req.query.buscar);
  if (buscar) {
    condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
    params.push(`%${buscar}%`, `%${buscar}%`);
  }

  const [productos] = await pool.query(
    `${SELECT}
     ${condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''}
     ORDER BY p.nombre ASC`,
    params
  );
  res.json(productos);
});

router.get('/:id', async (req, res) => {
  const id = leerId(req.params.id);
  res.json(await buscarProducto(id, { incluirInactivo: requireAdmin.esAdmin(req) }));
});

router.post('/', requireAdmin, async (req, res) => {
  const datos = leerCampos(req.body, ESQUEMA);
  const [resultado] = await pool.query('INSERT INTO productos SET ?', [datos]);
  res.status(201).json(await buscarProducto(resultado.insertId));
});

router.put('/:id', requireAdmin, async (req, res) => {
  const id = leerId(req.params.id);
  const datos = leerCampos(req.body, ESQUEMA, { parcial: true });
  await buscarProducto(id);
  await pool.query('UPDATE productos SET ? WHERE id = ?', [datos, id]);
  res.json(await buscarProducto(id));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = leerId(req.params.id);
  await buscarProducto(id);

  if (esVerdadero(req.query.definitivo)) {
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Producto eliminado' });
  }

  await pool.query('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
  res.json({ success: true, message: 'Producto desactivado', producto: await buscarProducto(id) });
});

module.exports = router;
