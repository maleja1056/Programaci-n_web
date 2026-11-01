// Sección "Conoce Bucaramanga" (#bucaramanga): tres lugares turísticos de
// Bucaramanga y su área metropolitana.
// Las imágenes y sus datos NO están en el frontend: los entrega el servidor de
// contenidos del backend (express.static en /publico, ver backend/server.js).
// Primero se lee /publico/turismo/imagenes.json y luego cada imagen se carga
// desde /publico/turismo/<archivo>. Si el backend no responde (por ejemplo,
// en el modo demostración), la sección no se muestra.
// Las tres fotos forman una franja de borde a borde, fundidas entre sí con
// un degradado. En computador, la que tiene el mouse o el foco del teclado
// se ensancha y muestra su descripción (home.css). En celular van en
// columna, con toda la información.
import { useEffect, useState } from "react";

const CARPETA = "/publico/turismo";

function TurismoSection() {
  const [lugares, setLugares] = useState([]);

  useEffect(() => {
    let activo = true;
    fetch(`${CARPETA}/imagenes.json`)
      .then((respuesta) => (respuesta.ok ? respuesta.json() : []))
      .then((datos) => {
        if (activo && Array.isArray(datos)) setLugares(datos);
      })
      .catch(() => {}); // sin backend: la sección queda oculta
    return () => {
      activo = false;
    };
  }, []);

  if (!lugares.length) return null;

  return (
    <section className="home-section turismo-section" id="bucaramanga">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CONOCE BUCARAMANGA</span>
          <h2>Lugares para visitar en el área metropolitana</h2>
          <p>Tres lugares de Bucaramanga y sus alrededores que vale la pena conocer.</p>
        </div>
      </div>

      <div className="turismo-franja">
        {lugares.map((lugar) => (
          <figure className="turismo-card" key={lugar.archivo}>
            <img
              src={`${CARPETA}/${lugar.archivo}`}
              alt={`${lugar.titulo}, ${lugar.municipio}`}
              loading="lazy"
              width="1200"
              height="900"
            />
            <figcaption>
              <span className="turismo-municipio">{lugar.municipio}</span>
              <h3>{lugar.titulo}</h3>
              {/* La descripción se despliega en la foto activa */}
              <div className="turismo-detalle">
                <div>
                  <p>{lugar.descripcion}</p>
                </div>
              </div>
              {/* Crédito obligatorio por la licencia Creative Commons */}
              <small>
                Foto:{" "}
                <a href={lugar.fuente} target="_blank" rel="noreferrer">
                  {lugar.autor}
                </a>{" "}
                ({lugar.anio}),{" "}
                <a href={lugar.licencia_url} target="_blank" rel="noreferrer">
                  {lugar.licencia}
                </a>
                , Wikimedia Commons.
              </small>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default TurismoSection;
