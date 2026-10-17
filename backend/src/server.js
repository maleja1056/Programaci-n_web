// Servidor Express de FarmaUIS (fase siguiente; en la Fase I el frontend
// funciona sin él, ver frontend/src/api/config.js). Registra los middlewares
// (CORS, JSON y sesión), las rutas /api/* y un manejador final de errores.
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { sessionMiddleware } = require('./config/session');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');
const panelRoutes = require('./routes/panel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(sessionMiddleware);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/panel', panelRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS conexion');
    res.json({
      estado: 'correcto',
      mensaje: 'Backend conectado a MySQL',
      mysql: rows[0].conexion === 1,
    });
  } catch (error) {
    console.error('Error de conexión a MySQL:', error.message);
    res.status(500).json({
      estado: 'error',
      mensaje: 'No fue posible conectar con MySQL',
    });
  }
});

// Respuestas JSON para errores no controlados, sin exponer trazas internas.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'El cuerpo de la petición no es un JSON válido',
    });
  }

  console.error('Error no controlado:', error.message);
  res.status(error.status || 500).json({
    success: false,
    message: 'Error interno del servidor',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmaUIS API disponible en el puerto ${PORT}`);
});
