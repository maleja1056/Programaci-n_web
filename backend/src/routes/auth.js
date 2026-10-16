
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const requireAuth = require('../middleware/requireAuth');
const { SESSION_COOKIE_NAME } = require('../config/session');

const router = express.Router();

// Hash de relleno para que un correo inexistente tarde lo mismo que una
// contraseña incorrecta y no revele qué correos están registrados.
const HASH_FALSO = bcrypt.hashSync('farmauis-hash-de-relleno', 10);

const CREDENCIALES_INCORRECTAS = 'Correo o contraseña incorrectos';

// Datos públicos que se guardan en la sesión y se envían al frontend.
const usuarioPublico = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  correo: usuario.correo,
  rol: usuario.rol,
});

router.post('/login', async (req, res) => {
  const { correo, password } = req.body || {};

  if (
    typeof correo !== 'string' ||
    typeof password !== 'string' ||
    !correo.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: 'El correo y la contraseña son obligatorios',
    });
  }

  if (correo.length > 190 || password.length > 128) {
    return res.status(400).json({
      success: false,
      message: 'El correo o la contraseña superan la longitud permitida',
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, correo, password_hash, rol, activo
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo.trim()]
    );

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(
      password,
      usuario ? usuario.password_hash : HASH_FALSO
    );

    if (!usuario || !passwordValida || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: CREDENCIALES_INCORRECTAS,
      });
    }

    // Se genera un identificador de sesión nuevo al iniciar sesión.
    req.session.regenerate((error) => {
      if (error) {
        console.error('Error al crear la sesión:', error.message);
        return res.status(500).json({
          success: false,
          message: 'No fue posible iniciar sesión',
        });
      }

      req.session.user = usuarioPublico(usuario);

      res.json({
        success: true,
        message: 'Inicio de sesión correcto',
        user: req.session.user,
      });
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({
      success: false,
      message: 'No fue posible iniciar sesión',
    });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.session.user,
  });
});

router.post('/logout', (req, res) => {
  const limpiarCookie = () => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  };

  if (!req.session) {
    return limpiarCookie();
  }

  req.session.destroy((error) => {
    if (error) {
      console.error('Error al cerrar la sesión:', error.message);
      return res.status(500).json({
        success: false,
        message: 'No fue posible cerrar la sesión',
      });
    }

    limpiarCookie();
  });
});

module.exports = router;
