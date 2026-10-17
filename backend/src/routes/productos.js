// GET /api/productos: lista los productos activos con el nombre de su
// categoría. Filtros opcionales: ?categoria=<id> y ?buscar=<texto en el nombre>.
// Las consultas usan "?" (parámetros) para evitar inyección SQL.
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { categoria, buscar } = req.query;

    let sql = `
      SELECT
        p.id,
        p.categoria_id,
        c.nombre AS categoria,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen_url,
        p.requiere_formula
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.activo = TRUE
    `;

    const params = [];

    if (categoria) {
      sql += ' AND p.categoria_id = ?';
      params.push(categoria);
    }

    if (buscar) {
      sql += ' AND p.nombre LIKE ?';
      params.push(`%${buscar}%`);
    }

    sql += ' ORDER BY p.nombre ASC';

    const [productos] = await pool.query(sql, params);

    res.json(productos);
  } catch (error) {
    console.error('Error al consultar productos:', error.message);
    res.status(500).json({
      mensaje: 'Error al consultar los productos',
    });
  }
});

module.exports = router;
