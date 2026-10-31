// Conexión a MySQL: carga el .env de la raíz del proyecto y crea un pool de
// conexiones que reutilizan todas las rutas (pool.query).
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
});

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'un_usr',
  password: process.env.MYSQL_PASSWORD || 'una_clave',
  database: process.env.MYSQL_DATABASE || 'farmauis',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

