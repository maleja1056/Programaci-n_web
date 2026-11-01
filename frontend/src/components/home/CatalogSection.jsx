// Sección "Productos para ti" (#productos): buscador, menú "Ordenar por"
// (Dropdown), filtro por tipo de producto ("Mostrar"), una fila de chips
// para filtrar por categoría (con su número de productos) y la cuadrícula
// de productos, con los estados
// de carga, error y sin resultados. No guarda estado propio: todo llega por
// props desde HomePage (hook useCatalog).
import Dropdown from "react-bootstrap/Dropdown";
import { PRODUCT_VIEWS, SORT_OPTIONS } from "../../hooks/useCatalog.js";
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
  productView,
  onProductViewChange,
  sortBy,
  onSortChange,
  onResetFilters,
}) {
  return (
    <section className="products-section" id="productos">
      <div className="products-heading">
        <div>
          <span className="section-kicker">NUESTRO CATÁLOGO</span>
          <h2>Qué hay hoy en la farmacia</h2>
          <p>Precios en pesos colombianos y unidades disponibles en este momento.</p>
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
          {/* onSelect recibe el eventKey del item elegido (clave de SORT_OPTIONS) */}
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
            <span>Mostrar:</span>
            <select
              value={productView}
              onChange={(event) => onProductViewChange(event.target.value)}
              aria-label="Mostrar por tipo de producto"
            >
              {Object.entries(PRODUCT_VIEWS).map(([key, view]) => (
                <option key={key} value={key}>
                  {view.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Filtro por categoría: un chip por categoría. El elegido queda
          marcado (aria-pressed). En celular la fila se desliza de lado. */}
      {categories.length > 1 && (
        <div className="category-chips" role="group" aria-label="Filtrar por categoría">
          {categories.map((category) => {
            const elegida = selectedCategory === category.name;
            return (
              <button
                type="button"
                key={category.id}
                className={`category-chip${elegida ? " is-active" : ""}`}
                aria-pressed={elegida}
                onClick={() => onSelectCategory(category.name)}
              >
                {category.color && (
                  <span className={`category-chip-dot art-${category.color}`} aria-hidden="true" />
                )}
                {category.name}
                <span className="category-chip-count">{category.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Se muestra uno de cuatro estados: cargando, error, productos o vacío */}
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
          <span className="empty-state-icon" aria-hidden="true">⌕</span>
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
