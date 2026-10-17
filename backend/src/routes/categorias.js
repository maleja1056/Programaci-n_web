// GET /api/categorias: lista las categorías activas ordenadas por nombre.
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [categorias] = await pool.query(
      `SELECT id, nombre, descripcion, activa, creado_en
       FROM categorias
       WHERE activa = TRUE
       ORDER BY nombre ASC`
    );

    res.json(categorias);
  } catch (error) {
    console.error('Error al consultar categorías:', error.message);
    res.status(500).json({
      mensaje: 'Error al consultar las categorías',
    });
  }
});

module.exports = router;
