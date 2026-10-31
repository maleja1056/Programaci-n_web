// Reglas compartidas por /api/pedidos y /api/detalle-pedidos.
//
// Quién puede ver y modificar un pedido:
//   - el administrador: todos los pedidos;
//   - el cliente: solo los suyos (los de otros responden 404, para no
//     revelar que existen).
//
// En qué estados se pueden cambiar las líneas (productos y cantidades):
//   - cliente: "pendiente";
//   - administrador: "pendiente", "confirmado" o "preparando".
//
// Stock: al agregar un producto a un pedido se descuenta del stock; al
// quitarlo, bajar la cantidad o cancelar el pedido, se devuelve. Todo se hace
// dentro de una transacción (lib/transaccion.js) con SELECT ... FOR UPDATE,
// para que dos pedidos a la vez no vendan el mismo stock.
const { HttpError } = require('./http');

const ESTADOS = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'];
const ESTADOS_EDITABLES_ADMIN = ['pendiente', 'confirmado', 'preparando'];

const esAdmin = (user) => user.rol === 'administrador';

// Carga el pedido (bloqueado si se pasa forUpdate) y comprueba que el usuario
// tenga acceso. Responde 404 si no existe o es de otro cliente.
async function cargarPedido(db, id, user, { forUpdate = false } = {}) {
  const [filas] = await db.query(
    `SELECT id, usuario_id, estado, direccion_entrega FROM pedidos WHERE id = ?
     ${forUpdate ? 'FOR UPDATE' : ''}`,
    [id]
  );
  const pedido = filas[0];
  if (!pedido || (!esAdmin(user) && pedido.usuario_id !== user.id)) {
    throw new HttpError(404, 'El pedido no existe');
  }
  return pedido;
}

// Además de cargarlo, exige que sus líneas se puedan modificar
async function cargarPedidoEditable(db, id, user) {
  const pedido = await cargarPedido(db, id, user, { forUpdate: true });
  const permitidos = esAdmin(user) ? ESTADOS_EDITABLES_ADMIN : ['pendiente'];
  if (!permitidos.includes(pedido.estado)) {
    throw new HttpError(
      409,
      esAdmin(user)
        ? `Un pedido en estado "${pedido.estado}" ya no se puede modificar`
        : 'Solo puedes modificar tus pedidos mientras están pendientes'
    );
  }
  return pedido;
}

// Producto bloqueado para cambiar su stock. Por defecto debe estar activo;
// exigirActivo = false sirve para devolver unidades de un producto que se
// desactivó después de venderlo.
async function cargarProductoParaVenta(db, productoId, { exigirActivo = true } = {}) {
  const [filas] = await db.query(
    'SELECT id, nombre, precio, stock, activo FROM productos WHERE id = ? FOR UPDATE',
    [productoId]
  );
  const producto = filas[0];
  if (!producto || (exigirActivo && !producto.activo)) {
    throw new HttpError(400, `El producto ${productoId} no existe o no está disponible`);
  }
  return producto;
}

// cambio > 0 descuenta stock (se venden unidades); cambio < 0 lo devuelve
async function moverStock(db, producto, cambio) {
  if (cambio > 0 && producto.stock < cambio) {
    throw new HttpError(
      409,
      `No hay stock suficiente de "${producto.nombre}" (disponibles: ${producto.stock})`
    );
  }
  await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cambio, producto.id]);
}

// Devuelve al stock todas las unidades de un pedido (al cancelarlo)
async function devolverStockDelPedido(db, pedidoId) {
  await db.query(
    `UPDATE productos p
     JOIN detalle_pedidos d ON d.producto_id = p.id
     SET p.stock = p.stock + d.cantidad
     WHERE d.pedido_id = ?`,
    [pedidoId]
  );
}

module.exports = {
  ESTADOS,
  esAdmin,
  cargarPedido,
  cargarPedidoEditable,
  cargarProductoParaVenta,
  moverStock,
  devolverStockDelPedido,
};
