// Datos de contacto y redes sociales que aparecen en el pie de página.
// PENDIENTE: los teléfonos, el correo y los enlaces son de ejemplo; cambiarlos
// por los reales si el equipo los tiene.
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

export const contacto = {
  direccion: "Universidad Industrial de Santander, Bucaramanga",
  telefono: "+57 300 000 0000",
  correo: "contacto@farmauis.local",
  horario: "Lunes a sábado, 8:00 a. m. – 8:00 p. m.",
};

// Cada red: nombre (para lectores de pantalla), enlace e icono
export const redesSociales = [
  { nombre: "Facebook", url: "https://www.facebook.com/", Icono: FaFacebookF },
  { nombre: "Instagram", url: "https://www.instagram.com/", Icono: FaInstagram },
  { nombre: "X (Twitter)", url: "https://x.com/", Icono: FaXTwitter },
  { nombre: "WhatsApp", url: "https://www.whatsapp.com/", Icono: FaWhatsapp },
];
