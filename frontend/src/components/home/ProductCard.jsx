// Tarjeta de un producto del catálogo: ilustración por categoría (color y
// símbolo vienen de useCatalog), etiqueta, nombre, precio y el botón "→" que
// muestra el detalle. La etiqueta "Con fórmula" es un botón con Popover.
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { formatPrice } from "../../utils/format.js";

// Popover que explica la etiqueta "Con fórmula" al pasar el mouse, tocarla
// o enfocarla con el teclado.
const formulaPopover = (
  <Popover id="popover-formula" className="formula-popover">
    <Popover.Header as="h4">Requiere fórmula médica</Popover.Header>
    <Popover.Body>
      Este producto solo se entrega con la fórmula de tu médico. Ten el
      documento a la mano al hacer tu pedido.
    </Popover.Body>
  </Popover>
);

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
        {product.requiereFormula ? (
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="bottom"
            overlay={formulaPopover}
          >
            <button type="button" className="product-label product-label-button">
              {product.label}
            </button>
          </OverlayTrigger>
        ) : (
          <span className="product-label">{product.label}</span>
        )}
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
