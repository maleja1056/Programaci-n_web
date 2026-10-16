
// Rechaza la petición con 401 si no existe una sesión válida en el servidor.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Debes iniciar sesión para acceder a este recurso',
    });
  }

  next();
}

module.exports = requireAuth;
