// Formulario de inicio de sesión con React-Bootstrap (Form).
// Lo usan el modal de la cabecera (LoginModal) y la página /login.
// La validación final la hace el backend: aquí solo se evita enviar campos
// vacíos y se muestran los mensajes de error.
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";
import { useAuth } from "../../context/auth-context.js";

const validate = (usuario, password) => {
  const errors = {};

  if (!usuario.trim()) errors.usuario = "Escribe tu usuario o correo.";
  if (!password) errors.password = "Escribe tu contraseña.";

  return errors;
};

function LoginForm({ onSuccess, autoFocus = false }) {
  const { login, sessionError } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const errors = validate(usuario, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const user = await login(usuario.trim(), password);
      // Tras el éxito el formulario puede desmontarse (se cierra el modal o
      // se redirige), por eso no se vuelve a cambiar su estado.
      onSuccess?.(user);
    } catch (err) {
      setError(
        err.status === 401
          ? "Usuario o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo."
          : err.message
      );
      setSubmitting(false);
    }
  };

  const alertMessage = error || sessionError;

  return (
    <Form className="auth-form" onSubmit={handleSubmit} noValidate>
      {alertMessage && (
        <Alert variant="danger" className="auth-alert" role="alert">
          {alertMessage}
        </Alert>
      )}

      <Form.Group className="mb-3" controlId="login-usuario">
        <Form.Label>Usuario o correo</Form.Label>
        <Form.Control
          type="text"
          autoComplete="username"
          placeholder="Tu usuario o correo"
          value={usuario}
          onChange={(event) => setUsuario(event.target.value)}
          isInvalid={Boolean(fieldErrors.usuario)}
          disabled={submitting}
          autoFocus={autoFocus}
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.usuario}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="login-password">
        <Form.Label>Contraseña</Form.Label>
        <InputGroup hasValidation>
          <Form.Control
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            isInvalid={Boolean(fieldErrors.password)}
            disabled={submitting}
          />
          {/* Botón para ver u ocultar la contraseña */}
          <Button
            variant="outline-secondary"
            className="auth-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-pressed={showPassword}
            aria-controls="login-password"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </Button>
          <Form.Control.Feedback type="invalid">
            {fieldErrors.password}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      <Button type="submit" className="auth-submit" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Validando...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>
    </Form>
  );
}

export default LoginForm;
