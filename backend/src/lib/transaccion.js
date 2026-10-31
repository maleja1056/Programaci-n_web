// Ejecuta varias consultas como una sola transacción: si alguna falla se
// deshacen todas (ROLLBACK). Se usa en pedidos y detalle de pedidos, donde
// cada cambio de una línea también actualiza el stock del producto.
const pool = require('../config/db');

async function enTransaccion(trabajo) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = enTransaccion;
