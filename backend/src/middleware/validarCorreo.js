// Aporte del equipo (Fase II, punto 5g): middleware que valida el correo
// electrónico con una expresión regular antes de guardar un usuario.
//
// La expresión exige:
//   - parte local: letras, números y . _ % + -, sin empezar ni terminar en
//     punto y sin dos puntos seguidos (ana.perez, ana_p+farma);
//   - una sola @;
//   - dominio: una o más partes separadas por puntos; cada parte con letras,
//     números o guiones, sin empezar ni terminar en guion (uis.edu);
//   - terminación de al menos 2 letras (.co, .com, .local).
//
// Si el correo es válido lo deja sin espacios y en minúsculas en req.body;
// si no, responde 400 y la petición no llega a la base de datos.
const PATRON_CORREO =
  /^[A-Za-z0-9_%+-]+(\.[A-Za-z0-9_%+-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

const LARGO_MAXIMO = 190; // igual que la columna usuarios.correo

// obligatorio = true para crear (POST); false para modificar (PUT), donde el
// correo solo se valida si viene en el cuerpo.
function validarCorreo({ obligatorio = true } = {}) {
  return (req, res, next) => {
    const correo = req.body?.correo;

    if (correo === undefined && !obligatorio) {
      return next();
    }

    if (typeof correo !== 'string' || !correo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es obligatorio',
      });
    }

    const limpio = correo.trim().toLowerCase();

    if (limpio.length > LARGO_MAXIMO || !PATRON_CORREO.test(limpio)) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico no tiene un formato válido (ejemplo: nombre@dominio.com)',
      });
    }

    req.body.correo = limpio;
    next();
  };
}

validarCorreo.PATRON_CORREO = PATRON_CORREO;

module.exports = validarCorreo;
