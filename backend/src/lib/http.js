// Utilidades comunes de las rutas de la API:
// - HttpError: error con código HTTP que el manejador final de server.js
//   convierte en una respuesta JSON { success: false, message }.
// - leerId: valida el parámetro :id de la URL.
// - leerCampos: valida el cuerpo de un POST o PUT según un esquema y devuelve
//   solo los campos permitidos (lo demás se ignora).
// - textoBusqueda y esVerdadero: leen los parámetros ?buscar= y ?todos=.

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.expose = true; // el mensaje se puede mostrar al usuario
  }
}

// :id debe ser un entero positivo; si no, se responde 400.
function leerId(valor, nombre = 'id') {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, `El ${nombre} debe ser un número entero positivo`);
  }
  return id;
}

// Valida un valor según su regla. Tipos: texto, entero, decimal, booleano y
// opcion (uno de regla.valores). regla.nulo permite null o "".
function validarValor(campo, valor, regla) {
  const etiqueta = regla.etiqueta || campo;

  if (valor === null || (valor === '' && regla.tipo !== 'texto')) {
    if (regla.nulo) return null;
    throw new HttpError(400, `El campo "${etiqueta}" es obligatorio`);
  }

  switch (regla.tipo) {
    case 'texto': {
      if (typeof valor !== 'string') {
        throw new HttpError(400, `El campo "${etiqueta}" debe ser un texto`);
      }
      const texto = valor.trim();
      if (!texto) {
        if (regla.nulo) return null;
        throw new HttpError(400, `El campo "${etiqueta}" es obligatorio`);
      }
      if (regla.min && texto.length < regla.min) {
        throw new HttpError(400, `El campo "${etiqueta}" debe tener al menos ${regla.min} caracteres`);
      }
      if (regla.max && texto.length > regla.max) {
        throw new HttpError(400, `El campo "${etiqueta}" admite máximo ${regla.max} caracteres`);
      }
      return texto;
    }
    case 'entero':
    case 'decimal': {
      const numero = typeof valor === 'string' ? Number(valor.trim()) : valor;
      const valido =
        typeof numero === 'number' &&
        Number.isFinite(numero) &&
        (regla.tipo === 'decimal' || Number.isInteger(numero));
      if (!valido) {
        throw new HttpError(400, `El campo "${etiqueta}" debe ser un número${regla.tipo === 'entero' ? ' entero' : ''}`);
      }
      const min = regla.min ?? 0;
      if (numero < min) {
        throw new HttpError(400, `El campo "${etiqueta}" debe ser mayor o igual a ${min}`);
      }
      if (regla.max !== undefined && numero > regla.max) {
        throw new HttpError(400, `El campo "${etiqueta}" debe ser menor o igual a ${regla.max}`);
      }
      return numero;
    }
    case 'booleano': {
      if ([true, 1, '1', 'true'].includes(valor)) return true;
      if ([false, 0, '0', 'false'].includes(valor)) return false;
      throw new HttpError(400, `El campo "${etiqueta}" debe ser verdadero o falso`);
    }
    case 'opcion': {
      if (!regla.valores.includes(valor)) {
        throw new HttpError(400, `El campo "${etiqueta}" debe ser uno de: ${regla.valores.join(', ')}`);
      }
      return valor;
    }
    default:
      throw new Error(`Tipo de campo desconocido: ${regla.tipo}`);
  }
}

// parcial = true (PUT): solo se validan los campos que vienen en el cuerpo.
// parcial = false (POST): los campos con regla.obligatorio deben venir.
function leerCampos(body, esquema, { parcial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'El cuerpo de la petición debe ser un objeto JSON');
  }

  const datos = {};
  for (const [campo, regla] of Object.entries(esquema)) {
    const valor = body[campo];
    if (valor === undefined) {
      if (!parcial && regla.obligatorio) {
        throw new HttpError(400, `El campo "${regla.etiqueta || campo}" es obligatorio`);
      }
      continue;
    }
    datos[campo] = validarValor(campo, valor, regla);
  }

  if (parcial && Object.keys(datos).length === 0) {
    throw new HttpError(400, 'No se envió ningún campo para modificar');
  }

  return datos;
}

// ?buscar=texto (máximo 100 caracteres). Devuelve null si no viene.
function textoBusqueda(valor) {
  if (typeof valor !== 'string' || !valor.trim()) return null;
  return valor.trim().slice(0, 100);
}

// ?todos=true / ?definitivo=1 ...
function esVerdadero(valor) {
  return valor === 'true' || valor === '1';
}

module.exports = { HttpError, leerId, leerCampos, textoBusqueda, esVerdadero };
