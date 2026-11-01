// Sección "Sobre nosotros" (#nosotros): texto con letra capital de color,
// un audio de música relajante y un video con un consejo de salud.
// Los archivos están en src/assets/audio, src/assets/video y src/assets/img.
import musicaRelajante from "../../assets/audio/musica-relajante.mp3";
import portadaVideo from "../../assets/img/lavado-manos-portada.jpg";
import videoLavadoManos from "../../assets/video/lavado-manos.mp4";

function AboutSection() {
  return (
    <section className="home-section about-section" id="nosotros">
      <div className="about-text">
        <span className="section-kicker">SOBRE NOSOTROS</span>
        <h2>Hecha en la UIS, para Bucaramanga</h2>

        {/* La clase drop-cap agranda y colorea la primera letra */}
        <p className="drop-cap">
          FarmaUIS nació de una pregunta sencilla: ¿por qué hay que ir de
          farmacia en farmacia para saber si tienen un medicamento y cuánto
          cuesta? Aquí ves el precio, las unidades disponibles y si necesitas
          fórmula médica antes de salir de casa.
        </p>
        <p>
          Somos un proyecto académico de estudiantes de la Universidad
          Industrial de Santander. La tienda funciona igual desde el celular,
          la tableta o el computador.
        </p>

        <div className="audio-card">
          <strong>Un momento para relajarte</strong>
          <span>Escucha música tranquila mientras exploras el catálogo.</span>
          <audio controls preload="none" src={musicaRelajante}>
            Tu navegador no puede reproducir este audio.
          </audio>
          <small>Música: «Relaxing piano music», Clavier Music (CC0).</small>
        </div>
      </div>

      <figure className="video-card">
        <video
          controls
          preload="metadata"
          playsInline
          poster={portadaVideo}
          src={videoLavadoManos}
          aria-label="Video: cómo lavarse las manos correctamente"
        >
          Tu navegador no puede reproducir este video.
        </video>
        <figcaption>
          <strong>Consejo de salud:</strong> lávate las manos con agua y jabón
          durante al menos 20 segundos.
          <small>Video: «Clean hands short», CDC (dominio público).</small>
        </figcaption>
      </figure>
    </section>
  );
}

export default AboutSection;
