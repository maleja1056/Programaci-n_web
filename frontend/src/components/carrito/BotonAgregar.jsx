// Botón "Agregar al carrito" de un producto del catálogo. Lo usan la tarjeta
// (ProductCard) y el modal de detalle (ProductDetailModal).
// Después de agregar muestra "Agregado" un momento; si el producto está
// agotado o ya está en el carrito todo su stock, el botón se desactiva.
import { useEffect, useState } from "react";
import { FaCartPlus, FaCheck } from "react-icons/fa6";
import { useCart } from "../../context/cart-context.js";

function BotonAgregar({ product, className = "", conTexto = true }) {
  const { items, agregar } = useCart();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return undefined;
    const espera = setTimeout(() => setAgregado(false), 1500);
    return () => clearTimeout(espera);
  }, [agregado]);

  const enCarrito = items.find((item) => item.id === product.id)?.cantidad || 0;
  const lleno = enCarrito >= product.stock;
  const desactivado = product.soldOut || lleno;

  const texto = product.soldOut
    ? "Agotado"
    : agregado
      ? "Agregado"
      : lleno
        ? "Todo el stock en tu carrito"
        : "Agregar al carrito";

  const alClic = () => {
    agregar({
      id: product.id,
      nombre: product.name,
      precio: product.price,
      stock: product.stock,
      requiereFormula: product.requiereFormula,
    });
    setAgregado(true);
  };

  return (
    <button
      type="button"
      className={`boton-agregar ${agregado ? "is-done" : ""} ${className}`.trim()}
      onClick={alClic}
      disabled={desactivado}
      aria-label={conTexto ? undefined : `${texto}: ${product.name}`}
      title={conTexto ? undefined : texto}
    >
      {agregado ? <FaCheck aria-hidden="true" /> : <FaCartPlus aria-hidden="true" />}
      {conTexto && <span>{texto}</span>}
      {/* Anuncia "Agregado" a los lectores de pantalla */}
      <span className="visually-hidden" aria-live="polite">
        {agregado ? `${product.name} agregado al carrito` : ""}
      </span>
    </button>
  );
}

export default BotonAgregar;
