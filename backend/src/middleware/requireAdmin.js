// Solo deja pasar a usuarios con sesión y rol "administrador".
// Sin sesión responde 401 (lo hace requireAuth); con otro rol, 403.
const requireAuth = require('./requireAuth');

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.session.user.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Esta acción solo la puede hacer un administrador',
      });
    }
    next();
  });
}

// true si la petición viene de un administrador (no responde nada; sirve
// para rutas públicas que muestran más datos a los administradores).
requireAdmin.esAdmin = (req) => req.session?.user?.rol === 'administrador';

module.exports = requireAdmin;
