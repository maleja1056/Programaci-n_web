// Página privada /panel: panel de administración de FarmaUIS.
// Solo para el rol "administrador": un cliente que llegue aquí (por ejemplo,
// justo después de iniciar sesión) se envía a /perfil.
// Arriba muestra el resumen del catálogo (productos, categorías y productos
// sin stock) y debajo una pestaña (Tabs de React-Bootstrap) por tabla de la
// base de datos, donde se listan, buscan, crean, editan y cancelan registros.
// La pestaña abierta se guarda en la URL (/panel?pestana=productos), así se
// conserva al recargar la página.
import { useCallback, useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import {
  FaBoxOpen,
  FaReceipt,
  FaTags,
  FaUsers,
} from "react-icons/fa6";
import { Navigate, useSearchParams } from "react-router-dom";
import { getPanelSummary } from "../api/auth.js";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import CategoriasTab from "../components/panel/CategoriasTab.jsx";
import PestanaPendiente from "../components/panel/PestanaPendiente.jsx";
import ProductosTab from "../components/panel/ProductosTab.jsx";
import { useAuth } from "../context/auth-context.js";

// Pestañas del panel, en orden. "Componente" es el contenido de cada una;
// las que aún no están hechas muestran un aviso (PestanaPendiente).
const PESTANAS = [
  {
    clave: "categorias",
    titulo: "Categorías",
    Icono: FaTags,
    Componente: CategoriasTab,
  },
  {
    clave: "productos",
    titulo: "Productos",
    Icono: FaBoxOpen,
    Componente: ProductosTab,
  },
  {
    clave: "usuarios",
    titulo: "Usuarios",
    Icono: FaUsers,
    Componente: () => <PestanaPendiente tabla="usuarios" />,
  },
  {
    clave: "pedidos",
    titulo: "Pedidos",
    Icono: FaReceipt,
    Componente: () => <PestanaPendiente tabla="pedidos" />,
  },
];

const esPestana = (clave) => PESTANAS.some((pestana) => pestana.clave === clave);

// Resumen del catálogo. "version" cambia cuando una pestaña guarda algo, y
// entonces se vuelve a pedir para que los totales estén al día.
function ResumenPanel({ version }) {
  const { handleUnauthorized } = useAuth();
  const [estado, setEstado] = useState({ version: null, resumen: null, error: "" });

  useEffect(() => {
    let activo = true;

    getPanelSummary()
      .then((data) => {
        if (activo) setEstado({ version, resumen: data.resumen, error: "" });
      })
      .catch((err) => {
        if (!activo) return;
        // La sesión expiró o se cerró: ProtectedRoute redirige al login
        if (err.status === 401) handleUnauthorized();
        else setEstado({ version, resumen: null, error: err.message });
      });

    return () => {
      activo = false;
    };
  }, [version, handleUnauthorized]);

  const { resumen, error } = estado;

  if (error) {
    return (
      <p className="panel-summary-error" role="alert">
        No se pudo cargar el resumen: {error}
      </p>
    );
  }

  const tarjetas = [
    { texto: "Productos activos", valor: resumen?.productos },
    { texto: "Categorías activas", valor: resumen?.categorias },
    { texto: "Productos sin stock", valor: resumen?.productosSinStock },
  ];

  return (
    <div className="panel-grid" aria-busy={!resumen}>
      {tarjetas.map((tarjeta) => (
        <article className="panel-stat" key={tarjeta.texto}>
          <span>{tarjeta.texto}</span>
          <strong>{tarjeta.valor ?? "—"}</strong>
        </article>
      ))}
    </div>
  );
}

function PanelPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [versionResumen, setVersionResumen] = useState(0);

  // Cada pestaña llama a esto después de guardar para actualizar el resumen
  const alGuardar = useCallback(() => setVersionResumen((n) => n + 1), []);

  // Los clientes no administran la tienda: su página es /perfil
  if (user.rol !== "administrador") {
    return <Navigate to="/perfil" replace />;
  }

  const pedida = searchParams.get("pestana");
  const activa = esPestana(pedida) ? pedida : PESTANAS[0].clave;

  const cambiarPestana = (clave) =>
    setSearchParams(clave === PESTANAS[0].clave ? {} : { pestana: clave }, {
      replace: true,
    });

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="panel-page">
        <div className="panel-heading">
          <span className="section-kicker">PANEL DE ADMINISTRACIÓN</span>
          <h1>Hola, {user.nombre}</h1>
          <p>
            Administra el catálogo, los usuarios y los pedidos de FarmaUIS.
            Sesión iniciada como <strong>{user.correo}</strong>.
          </p>
        </div>

        <ResumenPanel version={versionResumen} />

        {/* mountOnEnter: cada pestaña pide sus datos la primera vez que se abre */}
        <Tabs
          id="panel-pestanas"
          className="panel-tabs"
          activeKey={activa}
          onSelect={cambiarPestana}
          mountOnEnter
        >
          {PESTANAS.map(({ clave, titulo, Icono, Componente }) => (
            <Tab
              key={clave}
              eventKey={clave}
              title={
                <span className="panel-tab-title">
                  <Icono aria-hidden="true" /> {titulo}
                </span>
              }
            >
              <Componente alGuardar={alGuardar} />
            </Tab>
          ))}
        </Tabs>
      </main>

      <SiteFooter />
    </div>
  );
}

export default PanelPage;
