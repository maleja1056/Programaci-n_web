// Pestaña "Usuarios" del panel de administración (/panel).
// CRUD de la tabla usuarios con CrudTable: listar, buscar (nombre, apellido,
// usuario o correo), filtrar por rol, crear, editar, desactivar
// (activo = FALSE), reactivar y borrar definitivamente.
// - La contraseña solo es obligatoria al crear; al editar, si se deja vacía,
//   se conserva la actual. La API nunca devuelve password_hash.
// - El correo lo valida el servidor con el middleware validarCorreo.
// - La fila del administrador que tiene la sesión abierta no muestra
//   "Desactivar" ni "Borrar": el servidor tampoco lo permite (se quedaría sin
//   acceso al panel).
import { useCallback, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import { crearCrud } from "../../api/crud.js";
import { useAuth } from "../../context/auth-context.js";
import CrudTable from "./CrudTable.jsx";

// Se crea una sola vez (fuera del componente) para que CrudTable no vuelva a
// pedir la lista en cada render
const api = crearCrud("usuarios");

const ROLES = [
  { valor: "cliente", texto: "Cliente" },
  { valor: "administrador", texto: "Administrador" },
];

const nombreCompleto = (fila) => `${fila.nombre} ${fila.apellido}`.trim();

const crearColumnas = (idPropio) => [
  {
    clave: "nombre",
    titulo: "Usuario",
    render: (fila) => (
      <>
        <span className="crud-cell-strong">
          {nombreCompleto(fila)}
          {fila.id === idPropio && " (tú)"}
        </span>
        <span className="crud-cell-sub">{fila.correo}</span>
      </>
    ),
  },
  {
    clave: "usuario",
    titulo: "Nombre de usuario",
    render: (fila) => fila.usuario || "—",
  },
  {
    clave: "rol",
    titulo: "Rol",
    render: (fila) =>
      fila.rol === "administrador" ? (
        <span className="crud-badge is-info">Administrador</span>
      ) : (
        "Cliente"
      ),
  },
];

// Campos del formulario. Mismos límites que el backend (routes/usuarios.js).
const campos = [
  {
    nombre: "nombre",
    etiqueta: "Nombre",
    obligatorio: true,
    maxLength: 100,
    ancho: "medio",
  },
  {
    nombre: "apellido",
    etiqueta: "Apellido",
    obligatorio: true,
    maxLength: 100,
    ancho: "medio",
  },
  {
    nombre: "correo",
    etiqueta: "Correo",
    tipo: "email",
    obligatorio: true,
    maxLength: 190,
    placeholder: "nombre@correo.com",
  },
  {
    nombre: "usuario",
    etiqueta: "Nombre de usuario",
    maxLength: 50,
    placeholder: "Por ejemplo: maria.perez",
    ayuda: "Opcional. Sin espacios; se puede usar para iniciar sesión en lugar del correo.",
  },
  {
    nombre: "password",
    etiqueta: "Contraseña",
    articulo: "la",
    tipo: "password",
    obligatorio: "crear",
    minLength: 4,
    maxLength: 128,
    ayuda: (modo) =>
      modo === "editar"
        ? "Déjala vacía para conservar la contraseña actual."
        : "Mínimo 4 caracteres.",
  },
  {
    nombre: "rol",
    etiqueta: "Rol",
    tipo: "select",
    obligatorio: true,
    inicial: "cliente",
    opciones: ROLES.map(({ valor, texto }) => ({ valor, texto })),
  },
  {
    nombre: "activo",
    etiqueta: "Activo (puede iniciar sesión)",
    tipo: "checkbox",
    inicial: true,
  },
];

function UsuariosTab({ alGuardar }) {
  const { user } = useAuth();
  const [rolFiltro, setRolFiltro] = useState("");

  const idPropio = user?.id;
  const columnas = useMemo(() => crearColumnas(idPropio), [idPropio]);
  const filaProtegida = useCallback((fila) => fila.id === idPropio, [idPropio]);
  const filtros = useMemo(() => (rolFiltro ? { rol: rolFiltro } : {}), [rolFiltro]);

  return (
    <CrudTable
      api={api}
      singular="usuario"
      columnas={columnas}
      campos={campos}
      campoActivo="activo"
      filtros={filtros}
      nombreFila={nombreCompleto}
      filaProtegida={filaProtegida}
      textoBusqueda="Buscar por nombre, usuario o correo..."
      avisoCancelar="no podrá iniciar sesión"
      avisoBorrar="Si el usuario tiene pedidos, el servidor no permitirá borrarlo: desactívalo en su lugar."
      alGuardar={alGuardar}
      herramientas={
        <Form.Select
          aria-label="Filtrar por rol"
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {ROLES.map(({ valor, texto }) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Form.Select>
      }
    />
  );
}

export default UsuariosTab;
