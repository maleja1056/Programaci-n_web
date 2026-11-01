// Diapositivas del carrusel de la portada.
// Para cambiar una imagen: reemplazar el archivo en src/assets/img/carrusel/
// con el mismo nombre, o importar otro archivo (jpg, png, svg) y ponerlo en
// "imagen". El texto se muestra encima de la imagen, a la izquierda, así que
// conviene que la ilustración quede a la derecha.
import asesoria from "../assets/img/carrusel/asesoria.svg";
import envios from "../assets/img/carrusel/envios.svg";
import vitaminas from "../assets/img/carrusel/vitaminas.svg";

export const diapositivas = [
  {
    id: "envios",
    imagen: envios,
    etiqueta: "ENVÍOS A DOMICILIO",
    titulo: "Tu pedido, hasta la puerta de tu casa",
    texto: "Entregamos en Bucaramanga, Floridablanca, Girón y Piedecuesta.",
    boton: "Ver productos",
    enlace: "#productos",
  },
  {
    id: "vitaminas",
    imagen: vitaminas,
    etiqueta: "VITAMINAS Y SUPLEMENTOS",
    titulo: "Vitamina C y suplementos",
    texto: "Lo básico para tu rutina diaria, con el precio a la vista.",
    boton: "Ver vitaminas",
    enlace: "/?categoria=Vitaminas+y+suplementos#productos",
  },
  {
    id: "asesoria",
    imagen: asesoria,
    etiqueta: "ASESORÍA FARMACÉUTICA",
    titulo: "¿Tienes dudas sobre un medicamento?",
    texto: "Revisa las preguntas frecuentes o escríbenos a nuestro correo.",
    boton: "Ver preguntas",
    enlace: "#preguntas",
  },
];
