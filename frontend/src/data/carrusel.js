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
    texto: "Elige tus productos y recíbelos sin salir de casa.",
    boton: "Ver productos",
    enlace: "#productos",
  },
  {
    id: "vitaminas",
    imagen: vitaminas,
    etiqueta: "VITAMINAS Y SUPLEMENTOS",
    titulo: "Energía y defensas para cada día",
    texto: "Descubre opciones para acompañar tu rutina de bienestar.",
    boton: "Ver categorías",
    enlace: "#categorias",
  },
  {
    id: "asesoria",
    imagen: asesoria,
    etiqueta: "ASESORÍA FARMACÉUTICA",
    titulo: "¿Tienes dudas sobre un medicamento?",
    texto: "Consulta nuestras preguntas frecuentes o escríbenos.",
    boton: "Ver preguntas",
    enlace: "#preguntas",
  },
];
