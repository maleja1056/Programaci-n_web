// CRUD de la tabla usuarios (/api/usuarios).
//   POST   /registro    registro público de clientes (rol "cliente").
//   GET    /            lista (administrador). ?buscar= busca en nombre,
//                       apellido, usuario y correo; ?rol=cliente|administrador.
//   GET    /:id         un usuario (administrador).
//   POST   /            crea un usuario con cualquier rol (administrador).
//   PUT    /:id         modifica (administrador); "password" es opcional.
//   DELETE /:id         cancela: activo = FALSE (administrador).
//                       ?definitivo=true lo borra, solo si no tiene pedidos.
// El correo pasa por el middleware validarCorreo (aporte del equipo).
// La contraseña se guarda con hash bcrypt y password_hash nunca se devuelve.
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const requireAdmin = require('../middleware/requireAdmin');
const validarCorreo = require('../middleware/validarCorreo');
const { HttpError, leerId, leerCampos, textoBusqueda, esVerdadero } = require('../lib/http');

const router = express.Router();

const ROLES = ['cliente', 'administrador'];

const ESQUEMA = {
  nombre: { tipo: 'texto', obligatorio: true, max: 100 },
  apellido: { tipo: 'texto', obligatorio: true, max: 100 },
  usuario: { tipo: 'texto', max: 50, nulo: true },
  correo: { tipo: 'texto', obligatorio: true, max: 190 }, // ya validado por validarCorreo
  password: { tipo: 'texto', obligatorio: true, min: 4, max: 128, etiqueta: 'contraseña' },
  rol: { tipo: 'opcion', valores: ROLES },
  activo: { tipo: 'booleano' },
};

// Columnas que se pueden devolver (sin password_hash)
const COLUMNAS = 'id, nombre, apellido, usuario, correo, rol, activo, creado_en';

// El nombre de usuario no puede tener espacios ni "@" (para no confundirlo
// con un correo en el inicio de sesión).
function comprobarNombreUsuario(usuario) {
  if (usuario && !/^[A-Za-z0-9._-]+$/.test(usuario)) {
    throw new HttpError(400, 'El usuario solo admite letras, números, punto, guion y guion bajo');
  }
}

// Convierte "password" en "password_hash" antes de guardar
async function prepararParaGuardar(datos) {
  comprobarNombreUsuario(datos.usuario);
  const { password, ...resto } = datos;
  if (password !== undefined) {
    resto.password_hash = await bcrypt.hash(password, 10);
  }
  return resto;
}

async function buscarUsuario(id) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM usuarios WHERE id = ?`, [id]);
  if (!filas[0]) throw new HttpError(404, 'El usuario no existe');
  return filas[0];
}

// Registro de clientes: cualquiera puede crear su cuenta, pero siempre con
// rol "cliente" y activa.
router.post('/registro', validarCorreo(), async (req, res) => {
  const { rol, activo, ...datos } = leerCampos(req.body, ESQUEMA);
  const [resultado] = await pool.query('INSERT INTO usuarios SET ?', [
    { ...(await prepararParaGuardar(datos)), rol: 'cliente', activo: true },
  ]);
  res.status(201).json(await buscarUsuario(resultado.insertId));
});

// Desde aquí, todas las rutas son del administrador
router.use(requireAdmin);

router.get('/', async (req, res) => {
  const condiciones = [];
  const params = [];

  const buscar = textoBusqueda(req.query.buscar);
  if (buscar) {
    condiciones.push('(nombre LIKE ? OR apellido LIKE ? OR usuario LIKE ? OR correo LIKE ?)');
    params.push(...Array(4).fill(`%${buscar}%`));
  }

  if (req.query.rol) {
    if (!ROLES.includes(req.query.rol)) {
      throw new HttpError(400, `El rol debe ser uno de: ${ROLES.join(', ')}`);
    }
    condiciones.push('rol = ?');
    params.push(req.query.rol);
  }

  const [usuarios] = await pool.query(
    `SELECT ${COLUMNAS} FROM usuarios
     ${condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''}
     ORDER BY nombre ASC, apellido ASC`,
    params
  );
  res.json(usuarios);
});

router.get('/:id', async (req, res) => {
  res.json(await buscarUsuario(leerId(req.params.id)));
});

router.post('/', validarCorreo(), async (req, res) => {
  const datos = await prepararParaGuardar(leerCampos(req.body, ESQUEMA));
  const [resultado] = await pool.query('INSERT INTO usuarios SET ?', [datos]);
  res.status(201).json(await buscarUsuario(resultado.insertId));
});

router.put('/:id', validarCorreo({ obligatorio: false }), async (req, res) => {
  const id = leerId(req.params.id);
  const datos = await prepararParaGuardar(leerCampos(req.body, ESQUEMA, { parcial: true }));
  await buscarUsuario(id);

  // El administrador no puede quitarse a sí mismo el rol ni desactivarse:
  // se quedaría sin acceso al panel.
  const esElMismo = id === req.session.user.id;
  if (esElMismo && ((datos.rol && datos.rol !== 'administrador') || datos.activo === false)) {
    throw new HttpError(400, 'No puedes quitarte el rol de administrador ni desactivar tu propia cuenta');
  }

  await pool.query('UPDATE usuarios SET ? WHERE id = ?', [datos, id]);
  const usuario = await buscarUsuario(id);

  // Si se editó a sí mismo, se actualizan los datos guardados en la sesión
  if (esElMismo) {
    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      usuario: usuario.usuario,
      correo: usuario.correo,
      rol: usuario.rol,
    };
  }

  res.json(usuario);
});

router.delete('/:id', async (req, res) => {
  const id = leerId(req.params.id);
  await buscarUsuario(id);

  if (id === req.session.user.id) {
    throw new HttpError(400, 'No puedes eliminar ni desactivar tu propia cuenta');
  }

  if (esVerdadero(req.query.definitivo)) {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Usuario eliminado' });
  }

  await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
  res.json({ success: true, message: 'Usuario desactivado', usuario: await buscarUsuario(id) });
});

module.exports = router;
