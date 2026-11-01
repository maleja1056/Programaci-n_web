// Modal (React-Bootstrap) con el "carnet" de un integrante del equipo. Se abre
// desde la sección "Nuestro equipo" del pie de página.
// - El borde izquierdo del carnet es un semicírculo y la foto es un círculo
//   con el mismo centro (footer.css).
// - El carnet se inclina en 3D hacia el mouse (o el dedo) y un brillo sigue
//   al cursor. Las variables CSS se escriben directo en el elemento, una vez
//   por cuadro (requestAnimationFrame), sin volver a renderizar React.
// - Con "reducir movimiento" no hay inclinación ni giro de entrada.
import { useRef } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Modal from "react-bootstrap/Modal";
import logo from "../../assets/img/logo.svg";
import { iniciales } from "../../data/equipo.js";

const INCLINACION_MAX = 12; // grados

function TeamMemberModal({ member, onHide }) {
  const cuadro = useRef(0);

  const mover = (evento) => {
    const carnet = evento.currentTarget;
    const { clientX, clientY } = evento;
    cancelAnimationFrame(cuadro.current);
    cuadro.current = requestAnimationFrame(() => {
      const r = carnet.getBoundingClientRect();
      // Posición del puntero de 0 a 1 dentro del carnet
      const x = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      const y = Math.min(Math.max((clientY - r.top) / r.height, 0), 1);
      carnet.style.setProperty("--ry", `${((x - 0.5) * 2 * INCLINACION_MAX).toFixed(2)}deg`);
      carnet.style.setProperty("--rx", `${((0.5 - y) * 2 * INCLINACION_MAX).toFixed(2)}deg`);
      carnet.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      carnet.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      carnet.classList.add("is-activo");
    });
  };

  const soltar = (evento) => {
    const carnet = evento.currentTarget;
    cancelAnimationFrame(cuadro.current);
    carnet.classList.remove("is-activo");
    carnet.style.setProperty("--rx", "0deg");
    carnet.style.setProperty("--ry", "0deg");
  };

  return (
    <Modal
      show={Boolean(member)}
      onHide={onHide}
      centered
      dialogClassName="team-modal"
      aria-labelledby="team-modal-title"
    >
      {member && (
        <div className="carnet-escena">
          <article
            className="carnet"
            onPointerMove={mover}
            onPointerLeave={soltar}
            onPointerCancel={soltar}
          >
            <div className="carnet-foto">
              {member.foto ? (
                <img src={member.foto} alt={`Foto de ${member.nombre}`} />
              ) : (
                <span aria-hidden="true">{iniciales(member.nombre)}</span>
              )}
            </div>

            <div className="carnet-datos">
              <span className="carnet-marca">
                <img src={logo} alt="" /> FarmaUIS · Nuestro equipo
              </span>
              <Modal.Title as="h2" id="team-modal-title" className="carnet-nombre">
                {member.nombre}
              </Modal.Title>
              <span className="carnet-rol">{member.rol}</span>
              <span className="carnet-programa">{member.programa}</span>
            </div>

            {/* Brillo que sigue al cursor (decorativo) */}
            <span className="carnet-brillo" aria-hidden="true" />

            <CloseButton
              className="carnet-cerrar"
              variant="white"
              aria-label="Cerrar"
              onClick={onHide}
            />
          </article>
        </div>
      )}
    </Modal>
  );
}

export default TeamMemberModal;
