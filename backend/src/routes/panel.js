// GET /api/panel/resumen: totales para la página privada /panel.
const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Todas las rutas del panel requieren una sesión válida.
router.use(requireAuth);

router.get('/resumen', async (req, res) => {
  try {
    const [[totales]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM productos WHERE activo = TRUE) AS productos,
         (SELECT COUNT(*) FROM categorias WHERE activa = TRUE) AS categorias,
         (SELECT COUNT(*) FROM productos
           WHERE activo = TRUE AND stock = 0) AS productos_sin_stock`
    );

    res.json({
      success: true,
      user: req.session.user,
      resumen: {
        productos: Number(totales.productos),
        categorias: Number(totales.categorias),
        productosSinStock: Number(totales.productos_sin_stock),
      },
    });
  } catch (error) {
    console.error('Error al consultar el resumen del panel:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al consultar el resumen del panel',
    });
  }
});

module.exports = router;
