// Banner final de la portada: lleva al carrito (con cuántas unidades tiene)
// o, si está vacío, al catálogo.
import { FaCartShopping } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useCart } from "../../context/cart-context.js";
import { plural } from "../../utils/format.js";

function CareBanner() {
  const { unidades } = useCart();

  return (
    <section className="care-banner">
      <div className="care-banner-icon" aria-hidden="true">
        <FaCartShopping />
      </div>
      <div>
        <h2>
          {unidades
            ? `Tienes ${plural(unidades, "unidad", "unidades")} en el carrito`
            : "¿Ya sabes qué necesitas?"}
        </h2>
        <p>
          {unidades
            ? "Confirma el pedido cuando quieras; tu carrito se guarda en este navegador."
            : "Agrega productos desde el catálogo y confirma el pedido cuando estés listo."}
        </p>
      </div>
      {unidades ? (
        <Link className="secondary-button" to="/carrito">
          Ir al carrito
        </Link>
      ) : (
        <a className="secondary-button" href="#productos">
          Ver el catálogo
        </a>
      )}
    </section>
  );
}

export default CareBanner;
