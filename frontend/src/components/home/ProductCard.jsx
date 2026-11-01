// Tarjeta de un producto del catálogo: ilustración del producto
// (ProductoIlustracion, con el color de su categoría), etiqueta, nombre, precio, stock, el botón
// del carrito y el botón "→" que abre el modal de detalle. La etiqueta "Con fórmula" es un botón con
// Popover. Los productos agotados se muestran atenuados.
import { useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { formatPrice, formatStock } from "../../utils/format.js";
import BotonAgregar from "../carrito/BotonAgregar.jsx";
import ProductDetailModal from "./ProductDetailModal.jsx";
import ProductoIlustracion from "./ProductoIlustracion.jsx";

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
  // Controla si el modal de detalle está abierto
  const [showDetail, setShowDetail] = useState(false);

  return (
    <article className={product.soldOut ? "product-card is-sold-out" : "product-card"}>
      <div className={`product-art art-${product.color}`}>
        {product.requiereFormula && !product.soldOut ? (
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
          <span className={product.soldOut ? "product-label label-sold-out" : "product-label"}>
            {product.label}
          </span>
        )}
        <ProductoIlustracion tipo={product.ilustracion} />
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="product-stock">
          {product.soldOut ? "Sin unidades por ahora" : `Stock: ${formatStock(product.stock)}`}
        </span>
        <div className="product-bottom">
          <strong className="product-price">
            {formatPrice(product.price)}
          </strong>
          <BotonAgregar product={product} conTexto={false} className="product-cart" />
          <button
            className="view-product"
            type="button"
            onClick={() => setShowDetail(true)}
            aria-label={`Ver detalle de ${product.name}`}
          >
            →
          </button>
        </div>
      </div>

      <ProductDetailModal
        product={product}
        show={showDetail}
        onHide={() => setShowDetail(false)}
      />
    </article>
  );
}

export default ProductCard;
