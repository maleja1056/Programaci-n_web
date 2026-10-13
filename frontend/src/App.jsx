
import { useMemo, useState } from "react";
import "./App.css";

const products = [
  {
    id: 1,
    name: "Vitamina C",
    description: "Suplemento vitamínico",
    category: "Vitaminas",
    price: 28500,
    color: "orange",
    symbol: "C",
    label: "Bienestar",
  },
  {
    id: 2,
    name: "Protector solar",
    description: "Protección para la piel",
    category: "Cuidado personal",
    price: 42000,
    color: "blue",
    symbol: "SPF",
    label: "Cuidado diario",
  },
  {
    id: 3,
    name: "Gel antibacterial",
    description: "Higiene para tus manos",
    category: "Cuidado personal",
    price: 12500,
    color: "mint",
    symbol: "+",
    label: "Esencial",
  },
  {
    id: 4,
    name: "Multivitamínico",
    description: "Complemento alimenticio",
    category: "Vitaminas",
    price: 36500,
    color: "purple",
    symbol: "V",
    label: "Bienestar",
  },
  {
    id: 5,
    name: "Crema hidratante",
    description: "Hidratación para la piel",
    category: "Cuidado personal",
    price: 31900,
    color: "pink",
    symbol: "H",
    label: "Favorito",
  },
  {
    id: 6,
    name: "Botiquín básico",
    description: "Elementos para primeros auxilios",
    category: "Primeros auxilios",
    price: 48000,
    color: "green",
    symbol: "+",
    label: "Esencial",
  },
];

const categories = [
  { name: "Todos", symbol: "▦", description: "Todo el catálogo" },
  { name: "Vitaminas", symbol: "✳", description: "Vitaminas y bienestar" },
  {
    name: "Cuidado personal",
    symbol: "◇",
    description: "Cuida de ti cada día",
  },
  {
    name: "Primeros auxilios",
    symbol: "+",
    description: "Elementos esenciales",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

function App() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLocaleLowerCase("es").includes(query) ||
        product.description.toLocaleLowerCase("es").includes(query) ||
        product.category.toLocaleLowerCase("es").includes(query);

      const matchesCategory =
        selectedCategory === "Todos" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="app-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Tu bienestar, nuestra prioridad
        <span className="announcement-divider">·</span>
        Descubre una forma más fácil de cuidarte
        <span className="announcement-dot" />
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="FarmaUIS, inicio">
          <span className="brand-mark">
            <span className="brand-cross">+</span>
          </span>
          <span className="brand-name">
            Farma<span>UIS</span>
            <small>Tu farmacia de confianza</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Navegación principal">
          <a className="nav-link active" href="#inicio">
            Inicio
          </a>
          <a className="nav-link" href="#categorias">
            Categorías
          </a>
          <a className="nav-link" href="#productos">
            Productos
          </a>
        </nav>

        <a className="header-action" href="#productos">
          <span aria-hidden="true">⌕</span>
          Explorar tienda
        </a>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-icon">✳</span>
              CUIDAMOS DE TI
            </div>

            <h1>
              Tu salud merece
              <br />
              <span>lo mejor.</span>
            </h1>

            <p className="hero-description">
              Encuentra productos para tu bienestar y cuidado personal en un
              solo lugar. Una forma más sencilla de cuidar de ti y de los tuyos.
            </p>

            <a className="primary-button" href="#productos">
              Explorar productos <span aria-hidden="true">→</span>
            </a>

            <div className="hero-benefits">
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Compra sencilla</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">♡</span>
                <span>Bienestar para todos</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Ilustración de bienestar">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-leaf leaf-one" />
            <div className="hero-leaf leaf-two" />

            <div className="hero-product product-bottle">
              <div className="bottle-cap" />
              <div className="bottle-label">
                <span className="bottle-plus">+</span>
                <span>DAILY</span>
                <strong>CARE</strong>
                <small>BIENESTAR</small>
              </div>
            </div>

            <div className="hero-product product-box">
              <span className="box-plus">+</span>
              <span className="box-small">FARMAUIS</span>
              <strong>VITAL</strong>
              <span className="box-caption">CUIDADO DIARIO</span>
            </div>

            <div className="floating-note">
              <span className="floating-note-icon">✳</span>
              <span>
                <strong>Cuida de ti</strong>
                <small>Todos los días</small>
              </span>
            </div>

            <span className="decorative-plus plus-one">+</span>
            <span className="decorative-plus plus-two">+</span>
          </div>

          <div className="hero-bottom-label">
            BIENESTAR <span>·</span> CONFIANZA <span>·</span> CUIDADO
          </div>
        </section>

        <section className="categories-section" id="categorias">
          <div className="section-heading">
            <div>
              <span className="section-kicker">ENCUENTRA LO QUE NECESITAS</span>
              <h2>Explora por categorías</h2>
              <p>Todo para acompañar tu bienestar, en un mismo lugar.</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                className={`category-card ${
                  selectedCategory === category.name ? "selected" : ""
                }`}
                onClick={() => setSelectedCategory(category.name)}
                aria-pressed={selectedCategory === category.name}
              >
                <span className={`category-symbol symbol-${category.name === "Todos" ? "all" : category.name === "Vitaminas" ? "vitamins" : category.name === "Cuidado personal" ? "care" : "first-aid"}`}>
                  {category.symbol}
                </span>
                <span className="category-copy">
                  <strong>{category.name}</strong>
                  <small>{category.description}</small>
                </span>
                <span className="category-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="products-section" id="productos">
          <div className="products-heading">
            <div>
              <span className="section-kicker">NUESTRO CATÁLOGO</span>
              <h2>Productos para ti</h2>
              <p>Descubre opciones para acompañar tu rutina de cuidado.</p>
            </div>
            <span className="results-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          <div className="catalog-toolbar">
            <label className="search-box">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Busca vitaminas, cuidado personal..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Buscar productos"
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </label>

            <label className="category-select-label">
              <span>Filtrar:</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                aria-label="Filtrar por categoría"
              >
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
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
                        onClick={() =>
                          window.alert(
                            `${product.name}\n${product.description}\nPrecio de demostración: ${formatPrice(product.price)}`
                          )
                        }
                        aria-label={`Ver ${product.name}`}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">⌕</span>
              <h3>No encontramos productos</h3>
              <p>Prueba con otro nombre o selecciona una categoría diferente.</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("Todos");
                }}
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </section>

        <section className="care-banner">
          <div className="care-banner-icon">+</div>
          <div>
            <span className="section-kicker">FARMAUIS</span>
            <h2>Tu bienestar comienza con pequeños cuidados.</h2>
            <p>
              Explora nuestro catálogo de demostración y descubre opciones
              para tu rutina diaria.
            </p>
          </div>
          <a className="secondary-button" href="#productos">
            Ver catálogo <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark">
            <span className="brand-cross">+</span>
          </span>
          <span className="brand-name">
            Farma<span>UIS</span>
            <small>Tu farmacia de confianza</small>
          </span>
        </a>
        <p>Proyecto académico · FarmaUIS</p>
        <a href="#inicio" className="back-to-top">Volver arriba ↑</a>
      </footer>
    </div>
  );
}

export default App;
