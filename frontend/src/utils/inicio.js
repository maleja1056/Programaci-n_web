// Clic en el logo (cabecera y pie): además de ir a la portada ("/"), sube al
// inicio de la página. En la portada sube con desplazamiento suave; desde
// otra página, de una vez, para que la portada se vea desde arriba.
export function subirAlInicio() {
  const enPortada = window.location.pathname === "/";
  window.scrollTo({ top: 0, behavior: enPortada ? "smooth" : "auto" });
}
