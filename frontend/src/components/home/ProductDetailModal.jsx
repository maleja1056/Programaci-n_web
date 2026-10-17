// Modal (React-Bootstrap) con el detalle de un producto: categoría, nombre,
// descripción, precio, disponibilidad y aviso de fórmula médica.
// Se abre con el botón "→" de cada tarjeta (ProductCard).
import Modal from "react-bootstrap/Modal";
import { formatPrice, formatStock } from "../../utils/format.js";

function ProductDetailModal({ product, show, onHide }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="product-modal"
      aria-labelledby={`product-modal-title-${product.id}`}
    >
      <Modal.Header closeButton>
        {/* Misma ilustración de la tarjeta, en pequeño */}
        <span
          className={`product-modal-art art-${product.color}`}
          aria-hidden="true"
        >
          {product.symbol}
        </span>
        <div>
          <span className="section-kicker">{product.category}</span>
          <Modal.Title id={`product-modal-title-${product.id}`}>
            {product.name}
          </Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body>
        <p className="product-modal-description">{product.description}</p>

        <dl className="product-modal-details">
          <div>
            <dt>Precio</dt>
            <dd className="product-modal-price">{formatPrice(product.price)}</dd>
          </div>
          <div>
            <dt>Disponibilidad</dt>
            <dd className={product.soldOut ? "is-sold-out" : undefined}>
              {formatStock(product.stock)}
            </dd>
          </div>
          <div>
            <dt>Categoría</dt>
            <dd>{product.category}</dd>
          </div>
        </dl>

        {product.requiereFormula ? (
          <p className="product-modal-notice notice-formula" role="note">
            <strong>Requiere fórmula médica.</strong> Este producto solo se
            entrega con la fórmula de tu médico.
          </p>
        ) : (
          <p className="product-modal-notice" role="note">
            Producto de venta libre. Lee las indicaciones de uso y consulta
            a tu médico o farmacéutico si tienes dudas.
          </p>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ProductDetailModal;
