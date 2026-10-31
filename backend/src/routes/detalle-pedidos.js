// CRUD de la tabla detalle_pedidos (/api/detalle-pedidos): las líneas de un
// pedido (producto, cantidad y precio). Requiere sesión.
//   GET    /            lista. ?pedido=<id> filtra por pedido; ?buscar= busca
//                       por nombre del producto. El cliente ve solo las de sus
//                       pedidos.
//   GET    /:id         una línea.
//   POST   /            agrega un producto a un pedido:
//                       { pedido_id, producto_id, cantidad }. El precio se toma
//                       del producto y se descuenta el stock.
//   PUT    /:id         cambia la cantidad ({ cantidad }) y ajusta el stock.
//   DELETE /:id         quita la línea del pedido y devuelve el stock.
// Las reglas de quién puede modificar y en qué estado están en lib/pedidos.js.
const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/requireAuth');
const enTransaccion = require('../lib/transaccion');
const { HttpError, leerId, leerCampos, textoBusqueda } = require('../lib/http');
const {
  esAdmin,
  cargarPedido,
  cargarPedidoEditable,
  cargarProductoParaVenta,
  moverStock,
} = require('../lib/pedidos');

const router = express.Router();
router.use(requireAuth);

const ESQUEMA = {
  pedido_id: { tipo: 'entero', obligatorio: true, min: 1, etiqueta: 'pedido' },
  producto_id: { tipo: 'entero', obligatorio: true, min: 1, etiqueta: 'producto' },
  cantidad: { tipo: 'entero', obligatorio: true, min: 1, max: 1000 },
};

const SELECT = `
  SELECT d.id, d.pedido_id, pe.usuario_id, pe.estado AS estado_pedido,
         d.producto_id, p.nombre AS producto, d.cantidad, d.precio_unitario, d.subtotal
  FROM detalle_pedidos d
  JOIN pedidos pe ON pe.id = d.pedido_id
  JOIN productos p ON p.id = d.producto_id`;

// Carga una línea y comprueba que el usuario pueda verla (404 si no)
async function cargarLinea(db, id, user, { forUpdate = false } = {}) {
  const [filas] = await db.query(
    `SELECT id, pedido_id, producto_id, cantidad FROM detalle_pedidos WHERE id = ?
     ${forUpdate ? 'FOR UPDATE' : ''}`,
    [id]
  );
  if (!filas[0]) throw new HttpError(404, 'La línea del pedido no existe');
  // Si el pedido es de otro cliente, cargarPedido responde 404
  await cargarPedido(db, filas[0].pedido_id, user);
  return filas[0];
}

async function lineaCompleta(id) {
  const [[linea]] = await pool.query(`${SELECT} WHERE d.id = ?`, [id]);
  return linea;
}

router.get('/', async (req, res) => {
  const user = req.session.user;
  const condiciones = [];
  const params = [];

  if (!esAdmin(user)) {
    condiciones.push('pe.usuario_id = ?');
    params.push(user.id);
  }

  if (req.query.pedido) {
    condiciones.push('d.pedido_id = ?');
    params.push(leerId(req.query.pedido, 'id del pedido'));
  }

  const buscar = textoBusqueda(req.query.buscar);
  if (buscar) {
    condiciones.push('p.nombre LIKE ?');
    params.push(`%${buscar}%`);
  }

  const [lineas] = await pool.query(
    `${SELECT}
     ${condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''}
     ORDER BY d.pedido_id DESC, d.id ASC`,
    params
  );
  res.json(lineas);
});

router.get('/:id', async (req, res) => {
  const id = leerId(req.params.id);
  await cargarLinea(pool, id, req.session.user);
  res.json(await lineaCompleta(id));
});

router.post('/', async (req, res) => {
  const { pedido_id, producto_id, cantidad } = leerCampos(req.body, ESQUEMA);

  const id = await enTransaccion(async (db) => {
    await cargarPedidoEditable(db, pedido_id, req.session.user);
    const producto = await cargarProductoParaVenta(db, producto_id);
    await moverStock(db, producto, cantidad);
    // Si el producto ya está en el pedido, MySQL responde ER_DUP_ENTRY (409)
    const [resultado] = await db.query(
      `INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?)`,
      [pedido_id, producto_id, cantidad, producto.precio]
    );
    return resultado.insertId;
  });

  res.status(201).json(await lineaCompleta(id));
});

// Solo se cambia la cantidad: para cambiar de producto se borra la línea y se
// agrega otra (así el precio siempre es el del producto elegido).
router.put('/:id', async (req, res) => {
  const id = leerId(req.params.id);
  const { cantidad } = leerCampos(req.body, { cantidad: ESQUEMA.cantidad });

  await enTransaccion(async (db) => {
    const linea = await cargarLinea(db, id, req.session.user, { forUpdate: true });
    await cargarPedidoEditable(db, linea.pedido_id, req.session.user);
    const cambio = cantidad - linea.cantidad;
    // Para bajar la cantidad no hace falta que el producto siga activo
    const producto = await cargarProductoParaVenta(db, linea.producto_id, {
      exigirActivo: cambio > 0,
    });
    await moverStock(db, producto, cambio);
    await db.query('UPDATE detalle_pedidos SET cantidad = ? WHERE id = ?', [cantidad, id]);
  });

  res.json(await lineaCompleta(id));
});

router.delete('/:id', async (req, res) => {
  const id = leerId(req.params.id);

  await enTransaccion(async (db) => {
    const linea = await cargarLinea(db, id, req.session.user, { forUpdate: true });
    await cargarPedidoEditable(db, linea.pedido_id, req.session.user);
    // El stock vuelve aunque el producto esté desactivado
    await db.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [linea.cantidad, linea.producto_id]);
    await db.query('DELETE FROM detalle_pedidos WHERE id = ?', [id]);
  });

  res.json({ success: true, message: 'Producto quitado del pedido' });
});

module.exports = router;
