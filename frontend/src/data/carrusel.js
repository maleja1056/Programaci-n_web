// Diapositivas fijas del carrusel de la portada (PromoCarousel.jsx). La de
// "producto destacado" no está aquí: se arma con el catálogo real y se
// inserta en la segunda posición.
// Cada diapositiva tiene un "tipo" (cómo se dibuja) y un "tono" (color de
// fondo: verde, menta, naranja o azul; ver .tono-* en home.css).
import { FaCartPlus, FaClipboardCheck, FaTruckFast } from "react-icons/fa6";
import vitaminas from "../assets/img/carrusel/vitaminas.svg";

// Los tres pasos de una compra (diapositiva "Cómo pedir")
export const pasosPedido = [
  {
    Icono: FaCartPlus,
    titulo: "Arma tu carrito",
    texto: "Busca por nombre o categoría. Ver precios no requiere cuenta.",
  },
  {
    Icono: FaClipboardCheck,
    titulo: "Confirma el pedido",
    texto: "Inicia sesión y escribe la dirección. Puedes cambiarlo mientras esté pendiente.",
  },
  {
    Icono: FaTruckFast,
    titulo: "Recíbelo en casa",
    texto: "Te lo llevamos en el área metropolitana y pagas al recibir.",
  },
];

export const diapositivas = [
  {
    id: "como-pedir",
    tipo: "pasos",
    tono: "verde",
    etiqueta: "CÓMO PEDIR",
    titulo: "De la búsqueda a tu puerta en tres pasos",
    texto: "Sin filas ni llamadas: eliges, confirmas y lo recibes.",
    boton: "Ver el catálogo",
    enlace: "#productos",
  },
  {
    id: "vitaminas",
    tipo: "imagen",
    tono: "naranja",
    imagen: vitaminas,
    etiqueta: "VITAMINAS Y SUPLEMENTOS",
    titulo: "Vitamina C y suplementos",
    texto: "Lo básico para tu rutina diaria, con el precio a la vista.",
    boton: "Ver vitaminas",
    enlace: "/?categoria=Vitaminas+y+suplementos#productos",
  },
  {
    id: "consejo-calor",
    tipo: "consejo",
    tono: "azul",
    etiqueta: "CONSEJO DE SALUD",
    titulo: "Con el calor de Bucaramanga, cuida tus medicamentos",
    texto:
      "Guárdalos en un lugar fresco y seco, en su caja original y lejos del baño: el calor y la humedad los dañan.",
    boton: "Leer el artículo",
    // Artículo real (consultado el 1 de noviembre de 2026)
    enlaceExterno:
      "https://www.semana.com/salud/articulo/como-almacenar-y-desechar-los-medicamentos-correctamente/202408/",
    fuente: "Semana, «¿Cómo almacenar y desechar los medicamentos correctamente?», 16 de abril de 2024",
  },
];
