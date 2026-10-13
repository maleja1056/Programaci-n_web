
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmaUIS API disponible en el puerto ${PORT}`);
});
