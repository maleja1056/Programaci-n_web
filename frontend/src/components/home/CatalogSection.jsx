// Sección "Productos para ti" (#productos): buscador, filtro por categoría y
// cuadrícula de productos, con el menú "Ordenar por" (visible sin iniciar sesión) y los estados de carga, error y sin resultados.
import Dropdown from "react-bootstrap/Dropdown";
import { SORT_OPTIONS } from "../../hooks/useCatalog.js";
import ProductCard from "./ProductCard.jsx";

function CatalogSection({
  categories,
  products,
  loading,
  error,
  search,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onResetFilters,
}) {
  return (
    <section className="products-section" id="productos">
      <div className="products-heading">
        <div>
          <span className="section-kicker">NUESTRO CATÁLOGO</span>
          <h2>Productos para ti</h2>
          <p>Descubre opciones para acompañar tu rutina de cuidado.</p>
        </div>
        <span className="results-count">
          {loading
            ? "Cargando..."
            : `${products.length} ${
                products.length === 1 ? "producto" : "productos"
              }`}
        </span>
      </div>

      <div className="catalog-toolbar">
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Busca medicamentos, vitaminas..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Buscar productos"
          />
          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </label>

        <div className="catalog-filters">
        <div className="sort-select-label">
          <span>Ordenar por:</span>
          <Dropdown onSelect={onSortChange}>
            <Dropdown.Toggle variant="outline-success" size="sm">
              {SORT_OPTIONS[sortBy].label}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                <Dropdown.Item key={key} eventKey={key} active={key === sortBy}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <label className="category-select-label">
          <span>Filtrar:</span>
          <select
            value={selectedCategory}
            onChange={(event) => onSelectCategory(event.target.value)}
            aria-label="Filtrar por categoría"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        </div>
      </div>

      {loading ? (
        <div className="empty-state" role="status">
          <h3>Cargando catálogo...</h3>
          <p>Estamos consultando los productos de FarmaUIS.</p>
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <h3>No se pudo cargar el catálogo</h3>
          <p>{error}</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            Volver a intentar
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">⌕</span>
          <h3>No encontramos productos</h3>
          <p>
            Prueba con otro nombre o selecciona una categoría diferente.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={onResetFilters}
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </section>
  );
}

export default CatalogSection;
