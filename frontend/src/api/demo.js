// Simulación del backend para el modo demostración (ver api/config.js).
// Responde igual que los endpoints reales: devuelve los mismos datos y lanza
// ApiError con status 401 cuando no hay sesión o las credenciales fallan.
// El usuario y la contraseña están en el código, como pide la Fase I:
// Admin | 1234. La sesión se guarda en sessionStorage, así que se mantiene al
// recargar la página y termina al cerrar la pestaña.
import { categorias, productos } from "../data/productos.js";
import { ApiError } from "./client.js";

const USUARIO_DEMO = "Admin";
const PASSWORD_DEMO = "1234";

// Datos públicos del usuario, con los mismos campos que GET /api/auth/me
const usuarioDemo = {
  id: 1,
  nombre: "Administrador",
  apellido: "FarmaUIS",
  usuario: USUARIO_DEMO,
  correo: "admin@farmauis.com",
  rol: "administrador",
};

// En sessionStorage solo se guarda una marca; los datos del usuario salen
// siempre del código
const CLAVE_SESION = "farmauis.sesionDemo";

// Pausa corta para que se vean los indicadores de carga, como con un servidor
const esperar = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// sessionStorage puede fallar (navegación privada o almacenamiento bloqueado);
// en ese caso la sesión simplemente no se recuerda al recargar
const leerSesion = () => {
  try {
    return sessionStorage.getItem(CLAVE_SESION) === "1";
  } catch {
    return false;
  }
};

const guardarSesion = (activa) => {
  try {
    if (activa) sessionStorage.setItem(CLAVE_SESION, "1");
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Sin almacenamiento la sesión dura hasta recargar la página
  }
};

const exigirSesion = () => {
  if (!leerSesion()) throw new ApiError("No hay una sesión activa", 401);
};

export async function login(usuario, password) {
  await esperar();

  if (usuario !== USUARIO_DEMO || password !== PASSWORD_DEMO) {
    throw new ApiError("Usuario o contraseña incorrectos", 401);
  }

  guardarSesion(true);
  return { success: true, user: usuarioDemo };
}

export async function getSession() {
  exigirSesion();
  return { success: true, user: usuarioDemo };
}

export async function logout() {
  await esperar(150);
  guardarSesion(false);
  return { success: true };
}

// Mismos totales que calcula GET /api/panel/resumen
export async function getPanelSummary() {
  await esperar();
  exigirSesion();

  return {
    success: true,
    user: usuarioDemo,
    resumen: {
      productos: productos.length,
      categorias: categorias.length,
      productosSinStock: productos.filter((producto) => producto.stock === 0)
        .length,
    },
  };
}

// Equivale a GET /api/productos y GET /api/categorias juntos
export async function getCatalog() {
  await esperar();
  return { productos, categorias };
}
