// Servidor Express de FarmaUIS. Registra los middlewares (CORS, JSON y
// sesión), las rutas /api/* (un express.Router por tabla, con su CRUD) y un
// manejador final que convierte los errores en respuestas JSON.
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { sessionMiddleware } = require('./config/session');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');
const panelRoutes = require('./routes/panel');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');
const detallePedidosRoutes = require('./routes/detalle-pedidos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(sessionMiddleware);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/panel', panelRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/detalle-pedidos', detallePedidosRoutes);

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

// Rutas /api que no existen
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `No existe la ruta ${req.method} ${req.originalUrl}`,
  });
});

// Errores de MySQL que se deben a los datos enviados (no a un fallo del
// servidor) y el mensaje que se muestra en cada caso.
const ERRORES_MYSQL = {
  ER_DUP_ENTRY: [409, 'Ya existe un registro con ese valor (nombre, usuario o correo repetido)'],
  ER_NO_REFERENCED_ROW_2: [400, 'El registro relacionado no existe (revisa la categoría, el cliente o el producto)'],
  ER_ROW_IS_REFERENCED_2: [409, 'No se puede eliminar porque otros registros dependen de él; desactívalo en su lugar'],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, 'Algún valor no cumple las reglas de la tabla'], // MySQL
  ER_CONSTRAINT_FAILED: [400, 'Algún valor no cumple las reglas de la tabla'], // MariaDB (XAMPP)
  ER_DATA_TOO_LONG: [400, 'Algún texto supera la longitud permitida'],
  ER_WARN_DATA_OUT_OF_RANGE: [400, 'Algún número está fuera del rango permitido'],
};

// Respuestas JSON para los errores, sin exponer trazas internas. Express 5
// envía aquí también los errores lanzados dentro de las rutas async.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'El cuerpo de la petición no es un JSON válido',
    });
  }

  // HttpError (lib/http.js): validaciones y reglas de las rutas
  if (error.expose && error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  if (ERRORES_MYSQL[error.code]) {
    const [status, message] = ERRORES_MYSQL[error.code];
    return res.status(status).json({ success: false, message });
  }

  console.error('Error no controlado:', error.message);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmaUIS API disponible en el puerto ${PORT}`);
});
