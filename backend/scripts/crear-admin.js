
// Crea (o actualiza) el usuario administrador a partir de las variables
// ADMIN_* del archivo .env de la raíz del proyecto.
// Uso: npm run crear-admin
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function crearAdmin() {
  const {
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

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await pool.query(
    `INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol, activo)
     VALUES (?, ?, ?, ?, 'administrador', TRUE)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       apellido = VALUES(apellido),
       password_hash = VALUES(password_hash),
       rol = 'administrador',
       activo = TRUE`,
    [ADMIN_NOMBRE, ADMIN_APELLIDO, ADMIN_CORREO, passwordHash]
  );

  console.log(`Usuario administrador listo: ${ADMIN_CORREO}`);
}

crearAdmin()
  .catch((error) => {
    console.error('No fue posible crear el administrador:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
