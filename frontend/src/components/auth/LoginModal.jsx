// Modal de inicio de sesión (React-Bootstrap Modal) que se abre desde la
// cabecera. Si las credenciales son correctas, se cierra y lleva al panel.
// Con la prop alEntrar se cambia ese paso: el carrito la usa para quedarse
// en la página y terminar la compra.
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm.jsx";

function LoginModal({ show, onHide, alEntrar }) {
  const navigate = useNavigate();

  const handleSuccess = () => {
    onHide();
    if (alEntrar) alEntrar();
    else navigate("/panel");
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="login-modal"
      aria-labelledby="login-modal-title"
    >
      <Modal.Header closeButton>
        <div>
          <span className="section-kicker">ACCESO FARMAUIS</span>
          <Modal.Title id="login-modal-title">Inicia sesión</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <p className="auth-subtitle">
          Ingresa con tu cuenta para acceder a las páginas privadas.
        </p>
        {/* Se monta de nuevo en cada apertura, así el formulario empieza vacío */}
        {show && <LoginForm onSuccess={handleSuccess} autoFocus />}
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;
