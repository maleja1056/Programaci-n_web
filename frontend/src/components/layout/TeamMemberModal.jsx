// Modal (React-Bootstrap) con los datos básicos de un integrante del equipo.
// Se abre desde la sección "Nuestro equipo" del pie de página.
import Modal from "react-bootstrap/Modal";
import { iniciales } from "../../data/equipo.js";

function TeamMemberModal({ member, onHide }) {
  return (
    <Modal
      show={Boolean(member)}
      onHide={onHide}
      centered
      dialogClassName="team-modal"
      aria-labelledby="team-modal-title"
    >
      {member && (
        <>
          <Modal.Header closeButton>
            <div className="team-modal-heading">
              {member.foto ? (
                <img
                  className="team-avatar team-avatar-lg"
                  src={member.foto}
                  alt={`Foto de ${member.nombre}`}
                />
              ) : (
                <span className="team-avatar team-avatar-lg" aria-hidden="true">
                  {iniciales(member.nombre)}
                </span>
              )}
              <div>
                <span className="section-kicker">NUESTRO EQUIPO</span>
                <Modal.Title id="team-modal-title">{member.nombre}</Modal.Title>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <dl className="team-details">
              <div>
                <dt>Módulo</dt>
                <dd>{member.modulo}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{member.codigo}</dd>
              </div>
              <div>
                <dt>Programa</dt>
                <dd>{member.programa}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{member.correo}</dd>
              </div>
            </dl>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}

export default TeamMemberModal;
