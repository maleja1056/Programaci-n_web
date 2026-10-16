
// Crea (o actualiza) el usuario administrador a partir de las variables
// ADMIN_* del archivo .env de la raíz del proyecto.
// Uso: npm run crear-admin
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

// Las bases creadas antes de existir la columna "usuario" no la tienen;
// se añade aquí para no tener que ejecutar el ALTER TABLE a mano.
async function asegurarColumnaUsuario() {
  const [columnas] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'usuarios'
       AND column_name = 'usuario'`
  );

  if (Number(columnas[0].total) === 0) {
    await pool.query(
      `ALTER TABLE usuarios
       ADD COLUMN usuario VARCHAR(50) NULL UNIQUE AFTER apellido`
    );
    console.log('Columna "usuario" añadida a la tabla usuarios');
  }
}

async function crearAdmin() {
  const {
    ADMIN_USUARIO = 'Admin',
    ADMIN_CORREO,
    ADMIN_PASSWORD,
    ADMIN_NOMBRE = 'Admin',
    ADMIN_APELLIDO = 'FarmaUIS',
  } = process.env;

  if (!ADMIN_CORREO || !ADMIN_PASSWORD) {
    console.error('Define ADMIN_CORREO y ADMIN_PASSWORD en el archivo .env');
    process.exitCode = 1;
    return;
  }

  await asegurarColumnaUsuario();

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await pool.query(
    `INSERT INTO usuarios
       (nombre, apellido, usuario, correo, password_hash, rol, activo)
     VALUES (?, ?, ?, ?, ?, 'administrador', TRUE)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       apellido = VALUES(apellido),
       usuario = VALUES(usuario),
       password_hash = VALUES(password_hash),
       rol = 'administrador',
       activo = TRUE`,
    [ADMIN_NOMBRE, ADMIN_APELLIDO, ADMIN_USUARIO, ADMIN_CORREO, passwordHash]
  );

  console.log(`Usuario administrador listo: ${ADMIN_USUARIO} (${ADMIN_CORREO})`);
}

crearAdmin()
  .catch((error) => {
    console.error('No fue posible crear el administrador:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
