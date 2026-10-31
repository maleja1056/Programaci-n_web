// Crea la base de datos de FarmaUIS en el MySQL/MariaDB de XAMPP.
// Uso (desde backend/, con MySQL encendido en el panel de XAMPP):
//   npm run init-db
//
// Pasos que hace, en orden:
//   1. Se conecta como root (en XAMPP, root no tiene contraseña por defecto).
//   2. Crea el usuario de la aplicación un_usr / una_clave, obligatorio por
//      compatibilidad con el equipo del profesor.
//   3. Ejecuta database/schema.sql: crea la base "farmauis" y sus tablas.
//   4. Da permisos a un_usr sobre la base "farmauis".
//   5. Crea los usuarios de prueba con su contraseña cifrada (bcrypt).
//   6. Ejecuta database/datos.sql: categorías, productos y un pedido de ejemplo.
//   7. Comprueba que un_usr puede entrar y leer las tablas.
// Se puede ejecutar varias veces sin borrar ni duplicar datos.
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const CARPETA_BD = path.resolve(__dirname, '../../database');

// Nombre fijo de la base: es el que usan schema.sql y datos.sql
const BASE_DATOS = 'farmauis';

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  rootUser: process.env.MYSQL_ROOT_USER || 'root',
  rootPassword: process.env.MYSQL_ROOT_PASSWORD || '',
  appUser: process.env.MYSQL_USER || 'un_usr',
  appPassword: process.env.MYSQL_PASSWORD || 'una_clave',
};

// Usuarios para entrar al sitio por login. Las contraseñas se pueden cambiar
// en el .env (ADMIN_PASSWORD y CLIENTE_PASSWORD); estos son los valores que
// se documentan en el PDF de la entrega.
const USUARIOS_PRUEBA = [
  {
    nombre: process.env.ADMIN_NOMBRE || 'Administrador',
    apellido: process.env.ADMIN_APELLIDO || 'FarmaUIS',
    usuario: process.env.ADMIN_USUARIO || 'Admin',
    correo: process.env.ADMIN_CORREO || 'admin@farmauis.local',
    password: process.env.ADMIN_PASSWORD || '1234',
    rol: 'administrador',
  },
  {
    nombre: 'Cliente',
    apellido: 'De Prueba',
    usuario: 'cliente',
    correo: 'cliente@farmauis.local',
    password: process.env.CLIENTE_PASSWORD || 'cliente123',
    rol: 'cliente',
  },
];

const leerSql = (archivo) =>
  fs.readFileSync(path.join(CARPETA_BD, archivo), 'utf8');

// Crea (o actualiza la contraseña de) un_usr para los dos nombres con los que
// MySQL puede ver una conexión local: 'localhost' y '127.0.0.1'.
async function crearUsuarioApp(conexion) {
  for (const host of ['localhost', '127.0.0.1']) {
    await conexion.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [
      config.appUser,
      host,
      config.appPassword,
    ]);
    await conexion.query('ALTER USER ?@? IDENTIFIED BY ?', [
      config.appUser,
      host,
      config.appPassword,
    ]);
  }
}

async function darPermisos(conexion) {
  for (const host of ['localhost', '127.0.0.1']) {
    await conexion.query(
      `GRANT ALL PRIVILEGES ON \`${BASE_DATOS}\`.* TO ?@?`,
      [config.appUser, host]
    );
  }
  await conexion.query('FLUSH PRIVILEGES');
}

// Inserta los usuarios de prueba; si ya existen (mismo correo) actualiza sus
// datos y su contraseña, así el .env siempre manda.
async function crearUsuariosPrueba(conexion) {
  for (const u of USUARIOS_PRUEBA) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await conexion.query(
      `INSERT INTO usuarios
         (nombre, apellido, usuario, correo, password_hash, rol, activo)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         apellido = VALUES(apellido),
         usuario = VALUES(usuario),
         password_hash = VALUES(password_hash),
         rol = VALUES(rol),
         activo = TRUE`,
      [u.nombre, u.apellido, u.usuario, u.correo, passwordHash, u.rol]
    );
    console.log(`  Usuario listo: ${u.usuario} (${u.rol})`);
  }
}

// Última comprobación: entra como un_usr (el usuario que usa el backend) y
// cuenta las filas de cada tabla.
async function comprobarAccesoApp() {
  const conexion = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.appUser,
    password: config.appPassword,
    database: BASE_DATOS,
  });

  try {
    const [filas] = await conexion.query(
      `SELECT
         (SELECT COUNT(*) FROM categorias) AS categorias,
         (SELECT COUNT(*) FROM productos) AS productos,
         (SELECT COUNT(*) FROM usuarios) AS usuarios,
         (SELECT COUNT(*) FROM pedidos) AS pedidos,
         (SELECT COUNT(*) FROM detalle_pedidos) AS detalle_pedidos`
    );
    console.log(`  Acceso de ${config.appUser} correcto. Filas por tabla:`);
    console.table(filas[0]);
  } finally {
    await conexion.end();
  }
}

async function initDb() {
  console.log(
    `Conectando a MySQL en ${config.host}:${config.port} como ${config.rootUser}...`
  );

  // multipleStatements permite ejecutar los archivos .sql completos
  const conexion = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.rootUser,
    password: config.rootPassword,
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    console.log(`1. Usuario de la aplicación: ${config.appUser}`);
    await crearUsuarioApp(conexion);

    console.log(`2. Base de datos "${BASE_DATOS}" y tablas (schema.sql)`);
    await conexion.query(leerSql('schema.sql'));

    console.log(`3. Permisos de ${config.appUser} sobre "${BASE_DATOS}"`);
    await darPermisos(conexion);

    console.log('4. Usuarios de prueba');
    await crearUsuariosPrueba(conexion);

    console.log('5. Datos de ejemplo (datos.sql)');
    await conexion.query(leerSql('datos.sql'));
  } finally {
    await conexion.end();
  }

  console.log('6. Comprobación');
  await comprobarAccesoApp();
  console.log('Base de datos lista.');
}

initDb().catch((error) => {
  console.error('No fue posible crear la base de datos:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('¿Está encendido MySQL en el panel de control de XAMPP?');
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(
      'Revisa MYSQL_ROOT_USER y MYSQL_ROOT_PASSWORD en el archivo .env.'
    );
  }
  process.exitCode = 1;
});
