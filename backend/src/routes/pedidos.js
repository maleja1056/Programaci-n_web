// CRUD de la tabla pedidos (/api/pedidos). Requiere sesión.
//   GET    /            lista. El cliente ve solo los suyos; el administrador
//                       todos, con filtros ?usuario=<id> y ?estado=. ?buscar=
//                       busca en la dirección y en el nombre o correo del cliente.
//   GET    /:id         un pedido con sus líneas (productos).
//   POST   /            crea un pedido con sus líneas en una sola transacción:
//                       { direccion_entrega, lineas: [{ producto_id, cantidad }] }.
//                       El precio se toma del producto y se descuenta el stock.
//                       El administrador puede indicar usuario_id.
//   PUT    /:id         modifica. Cliente: solo direccion_entrega mientras está
//                       pendiente. Administrador: direccion_entrega y estado.
//   DELETE /:id         cancela: estado = 'cancelado' y devuelve el stock.
//                       El cliente solo puede cancelar sus pedidos pendientes.
// Los pedidos no se borran de la base de datos: quedan como historial.
const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/requireAuth');
const enTransaccion = require('../lib/transaccion');
const { HttpError, leerId, leerCampos, textoBusqueda } = require('../lib/http');
const {
  ESTADOS,
  esAdmin,
  cargarPedido,
  cargarProductoParaVenta,
  moverStock,
  devolverStockDelPedido,
} = require('../lib/pedidos');

const router = express.Router();
router.use(requireAuth);

const MAX_LINEAS = 50;

const ESQUEMA = {
  usuario_id: { tipo: 'entero', min: 1, etiqueta: 'cliente' },
  direccion_entrega: { tipo: 'texto', obligatorio: true, max: 255, etiqueta: 'dirección de entrega' },
  estado: { tipo: 'opcion', valores: ESTADOS },
};

const ESQUEMA_LINEA = {
  producto_id: { tipo: 'entero', obligatorio: true, min: 1, etiqueta: 'producto' },
  cantidad: { tipo: 'entero', obligatorio: true, min: 1, max: 1000 },
};

// Pedido con el cliente, el total y el número de productos
const SELECT = `
  SELECT
    pe.id, pe.usuario_id,
    CONCAT(u.nombre, ' ', u.apellido) AS cliente, u.correo AS cliente_correo,
    pe.estado, pe.direccion_entrega, pe.creado_en, pe.actualizado_en,
    COUNT(d.id) AS lineas,
    COALESCE(SUM(d.cantidad), 0) AS unidades,
    COALESCE(SUM(d.subtotal), 0) AS total
  FROM pedidos pe
  JOIN usuarios u ON u.id = pe.usuario_id
  LEFT JOIN detalle_pedidos d ON d.pedido_id = pe.id`;

async function pedidoCompleto(id) {
  const [[pedido]] = await pool.query(`${SELECT} WHERE pe.id = ? GROUP BY pe.id`, [id]);
  const [lineas] = await pool.query(
    `SELECT d.id, d.producto_id, p.nombre AS producto, d.cantidad,
            d.precio_unitario, d.subtotal
     FROM detalle_pedidos d
     JOIN productos p ON p.id = d.producto_id
     WHERE d.pedido_id = ?
     ORDER BY d.id`,
    [id]
  );
  return { ...pedido, detalle: lineas };
}

router.get('/', async (req, res) => {
  const user = req.session.user;
  const condiciones = [];
  const params = [];

  if (!esAdmin(user)) {
    condiciones.push('pe.usuario_id = ?');
    params.push(user.id);
  } else if (req.query.usuario) {
    condiciones.push('pe.usuario_id = ?');
    params.push(leerId(req.query.usuario, 'id del usuario'));
  }

  if (req.query.estado) {
    if (!ESTADOS.includes(req.query.estado)) {
      throw new HttpError(400, `El estado debe ser uno de: ${ESTADOS.join(', ')}`);
    }
    condiciones.push('pe.estado = ?');
    params.push(req.query.estado);
  }

  const buscar = textoBusqueda(req.query.buscar);
  if (buscar) {
    condiciones.push(
      "(pe.direccion_entrega LIKE ? OR CONCAT(u.nombre, ' ', u.apellido) LIKE ? OR u.correo LIKE ?)"
    );
    params.push(...Array(3).fill(`%${buscar}%`));
  }

  const [pedidos] = await pool.query(
    `${SELECT}
     ${condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''}
     GROUP BY pe.id
     ORDER BY pe.creado_en DESC, pe.id DESC`,
    params
  );
  res.json(pedidos);
});

router.get('/:id', async (req, res) => {
  const id = leerId(req.params.id);
  await cargarPedido(pool, id, req.session.user);
  res.json(await pedidoCompleto(id));
});

router.post('/', async (req, res) => {
  const user = req.session.user;
  const { usuario_id, direccion_entrega } = leerCampos(req.body, ESQUEMA);

  const lineas = req.body.lineas;
  if (!Array.isArray(lineas) || lineas.length === 0) {
    throw new HttpError(400, 'El pedido debe tener al menos un producto en "lineas"');
  }
  if (lineas.length > MAX_LINEAS) {
    throw new HttpError(400, `Un pedido admite máximo ${MAX_LINEAS} productos distintos`);
  }
  const lineasValidas = lineas.map((linea) => leerCampos(linea, ESQUEMA_LINEA));
  const ids = lineasValidas.map((linea) => linea.producto_id);
  if (new Set(ids).size !== ids.length) {
    throw new HttpError(400, 'Un producto aparece dos veces: suma las cantidades en una sola línea');
  }

  // El cliente siempre crea pedidos a su nombre
  const duenoId = esAdmin(user) && usuario_id ? usuario_id : user.id;

  const id = await enTransaccion(async (db) => {
    const [resultado] = await db.query(
      "INSERT INTO pedidos (usuario_id, direccion_entrega, estado) VALUES (?, ?, 'pendiente')",
      [duenoId, direccion_entrega]
    );

    // Se bloquean los productos en orden de id para evitar bloqueos cruzados
    for (const linea of [...lineasValidas].sort((a, b) => a.producto_id - b.producto_id)) {
      const producto = await cargarProductoParaVenta(db, linea.producto_id);
      await moverStock(db, producto, linea.cantidad);
      await db.query(
        `INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [resultado.insertId, producto.id, linea.cantidad, producto.precio]
      );
    }
    return resultado.insertId;
  });

  res.status(201).json(await pedidoCompleto(id));
});

router.put('/:id', async (req, res) => {
  const user = req.session.user;
  const id = leerId(req.params.id);
  const { direccion_entrega, estado } = leerCampos(req.body, ESQUEMA, { parcial: true });

  await enTransaccion(async (db) => {
    const pedido = await cargarPedido(db, id, user, { forUpdate: true });

    if (!esAdmin(user)) {
      if (estado !== undefined) {
        throw new HttpError(403, 'Solo un administrador puede cambiar el estado; para cancelar usa DELETE');
      }
      if (pedido.estado !== 'pendiente') {
        throw new HttpError(409, 'Solo puedes modificar tus pedidos mientras están pendientes');
      }
    }

    if (estado && estado !== pedido.estado) {
      if (pedido.estado === 'cancelado') {
        throw new HttpError(409, 'Un pedido cancelado no se puede reactivar; crea uno nuevo');
      }
      if (estado === 'cancelado') {
        if (pedido.estado === 'entregado') {
          throw new HttpError(409, 'Un pedido entregado no se puede cancelar');
        }
        await devolverStockDelPedido(db, id);
      }
    }

    const cambios = {};
    if (direccion_entrega !== undefined) cambios.direccion_entrega = direccion_entrega;
    if (estado !== undefined) cambios.estado = estado;
    if (Object.keys(cambios).length === 0) {
      throw new HttpError(400, 'No se envió ningún campo para modificar');
    }
    await db.query('UPDATE pedidos SET ? WHERE id = ?', [cambios, id]);
  });

  res.json(await pedidoCompleto(id));
});

router.delete('/:id', async (req, res) => {
  const user = req.session.user;
  const id = leerId(req.params.id);

  await enTransaccion(async (db) => {
    const pedido = await cargarPedido(db, id, user, { forUpdate: true });

    if (pedido.estado === 'cancelado') {
      throw new HttpError(409, 'El pedido ya está cancelado');
    }
    if (!esAdmin(user) && pedido.estado !== 'pendiente') {
      throw new HttpError(409, 'Solo puedes cancelar tus pedidos mientras están pendientes');
    }
    if (pedido.estado === 'entregado') {
      throw new HttpError(409, 'Un pedido entregado no se puede cancelar');
    }

    await devolverStockDelPedido(db, id);
    await db.query("UPDATE pedidos SET estado = 'cancelado' WHERE id = ?", [id]);
  });

  res.json({ success: true, message: 'Pedido cancelado', pedido: await pedidoCompleto(id) });
});

module.exports = router;
