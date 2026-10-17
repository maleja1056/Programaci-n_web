// Preguntas frecuentes que se muestran en el acordeón de la portada.
import { contacto } from "./sitio.js";

export const preguntas = [
  {
    id: "pedido",
    pregunta: "¿Cómo encuentro un producto?",
    respuesta:
      "Usa el buscador del catálogo o elige una categoría. Cada tarjeta muestra el precio y si el producto requiere fórmula médica. La compra en línea llegará en la siguiente fase del proyecto.",
  },
  {
    id: "formula",
    pregunta: "¿Qué productos requieren fórmula médica?",
    respuesta:
      "Los que tienen la etiqueta «Con fórmula». Para entregarlos es necesario presentar una fórmula médica vigente, como lo exige la regulación colombiana.",
  },
  {
    id: "cuenta",
    pregunta: "¿Necesito una cuenta para usar el sitio?",
    respuesta:
      "No para ver el catálogo. Las páginas privadas, como el panel y el perfil, solo están disponibles después de iniciar sesión.",
  },
  {
    id: "pagos",
    pregunta: "¿Qué medios de pago aceptan?",
    respuesta:
      "Tarjetas débito y crédito, transferencias y pago contra entrega en la ciudad.",
  },
  {
    id: "horario",
    pregunta: "¿Cuál es el horario de atención?",
    respuesta: `${contacto.horario}. Fuera de ese horario puedes escribirnos por redes sociales y te responderemos al día siguiente.`,
  },
];
