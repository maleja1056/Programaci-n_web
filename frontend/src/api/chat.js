// Chatbot: envía el mensaje a POST /api/chat. El backend lo pasa a los
// agentes de LangGraph y devuelve { respuesta, fuente, agentes, productos }.
// En el modo demostración (sin backend) responde un aviso fijo.
import { apiRequest } from "./client.js";
import { USAR_BACKEND } from "./config.js";

export async function enviarMensaje(mensaje, historial) {
  if (!USAR_BACKEND) {
    return {
      respuesta:
        "El asistente necesita el backend. Inícialo y desactiva el modo demostración para chatear.",
      fuente: "reglas",
      agentes: [],
      productos: [],
    };
  }
  return apiRequest("/api/chat", { method: "POST", body: { mensaje, historial } });
}
