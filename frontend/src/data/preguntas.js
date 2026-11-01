// Preguntas frecuentes que se muestran en el acordeón de la portada.
import { contacto } from "./sitio.js";

export const preguntas = [
  {
    id: "pedido",
    pregunta: "¿Cómo encuentro un producto?",
    respuesta:
      "Usa el buscador del catálogo o elige una categoría. Cada tarjeta muestra el precio, las unidades disponibles y si el producto requiere fórmula médica. Con el botón del carrito lo agregas a tu compra.",
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
      "No para ver el catálogo ni para armar tu carrito. Para confirmar el pedido sí debes iniciar sesión; después puedes seguirlo en «Mis pedidos».",
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
