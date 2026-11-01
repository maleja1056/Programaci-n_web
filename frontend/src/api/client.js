// Cliente HTTP común para las rutas /api. Las peticiones son relativas y pasan
// por el proxy de Vite, así que la cookie de sesión viaja en el mismo origen.

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const SERVER_UNAVAILABLE =
  "No fue posible conectar con el servidor. Comprueba que el backend esté funcionando e inténtalo de nuevo.";

export async function apiRequest(path, { method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(SERVER_UNAVAILABLE, 0);
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Si el backend está apagado, el proxy de Vite responde con un error 5xx
    // sin cuerpo JSON.
    const message =
      data?.message ||
      (response.status >= 500
        ? SERVER_UNAVAILABLE
        : "Ocurrió un error inesperado. Inténtalo de nuevo.");
    throw new ApiError(message, response.status);
  }

  if (!data) {
    throw new ApiError(
      "El servidor devolvió una respuesta inesperada.",
      response.status
    );
  }

  return data;
}
