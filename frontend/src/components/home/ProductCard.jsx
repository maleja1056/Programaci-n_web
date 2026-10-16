// Tarjeta de un producto del catálogo. El botón "→" muestra el detalle.
import { formatPrice } from "../../utils/format.js";

function ProductCard({ product }) {
  // Detalle provisional con window.alert (el Integrante 3 lo cambiará por un
  // modal de detalle de producto).
  const showDetail = () =>
    window.alert(
      `${product.name}\n${product.description}\nPrecio: ${formatPrice(product.price)}\nStock disponible: ${product.stock}\n${
        product.requiereFormula
          ? "Requiere fórmula médica."
          : "Consulta las indicaciones de uso."
      }`
    );

  return (
    <article className="product-card">
      <div className={`product-art art-${product.color}`}>
        <span className="product-label">{product.label}</span>
        <span className="product-symbol">{product.symbol}</span>
        <span className="product-art-brand">FARMAUIS</span>
        <span className="product-art-caption">
          {product.category.toUpperCase()}
        </span>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-bottom">
          <strong className="product-price">
            {formatPrice(product.price)}
          </strong>
          <button
            className="view-product"
            type="button"
            onClick={showDetail}
            aria-label={`Ver ${product.name}`}
          >
            →
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
