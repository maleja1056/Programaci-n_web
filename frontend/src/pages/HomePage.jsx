
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader.jsx";

const categoryVisuals = {
  "Medicamentos": { symbol: "+", style: "medicines" },
  "Cuidado personal": { symbol: "◇", style: "care" },
  "Vitaminas y suplementos": { symbol: "✳", style: "vitamins" },
  "Primeros auxilios": { symbol: "+", style: "first-aid" },
};

const productVisuals = {
  1: { color: "blue", symbol: "+" },
  2: { color: "mint", symbol: "◇" },
  3: { color: "orange", symbol: "C" },
  4: { color: "green", symbol: "+" },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/productos"),
          fetch("/api/categorias"),
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error(
            "El servidor no pudo cargar los productos y las categorías."
          );
        }

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!Array.isArray(productsData) || !Array.isArray(categoriesData)) {
          throw new Error("El servidor devolvió una respuesta inesperada.");
        }

        const normalizedProducts = productsData.map((product) => {
          const categoryId = Number(product.categoria_id);
          const visual = productVisuals[categoryId] || {
            color: "green",
            symbol: "+",
          };

          return {
            id: product.id,
            name: product.nombre,
            description: product.descripcion || "Sin descripción disponible",
            category: product.categoria || "Sin categoría",
            categoryId,
            price: Number(product.precio),
            stock: Number(product.stock),
            color: visual.color,
            symbol: visual.symbol,
            label: product.requiere_formula ? "Con fórmula" : "Disponible",
            requiereFormula: Boolean(product.requiere_formula),
          };
        });

        const normalizedCategories = [
          {
            id: "Todos",
            name: "Todos",
            symbol: "▦",
            description: "Todo el catálogo",
          },
          ...categoriesData.map((category) => {
            const visual = categoryVisuals[category.nombre] || {
              symbol: "+",
              style: "care",
            };

            return {
              id: category.id,
              name: category.nombre,
              symbol: visual.symbol,
              style: visual.style,
              description:
                category.descripcion || "Descubre nuestros productos",
            };
          }),
        ];

        setProducts(normalizedProducts);
        setCategories(normalizedCategories);
      } catch (err) {
        console.error("Error al cargar el catálogo:", err);
        setError(
          "No fue posible conectar con el catálogo. Comprueba que el backend y MySQL estén funcionando e inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

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
  }, [products, search, selectedCategory]);

  return (
    <div className="app-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Tu bienestar, nuestra prioridad
        <span className="announcement-divider">·</span>
        Descubre una forma más fácil de cuidarte
        <span className="announcement-dot" />
      </div>

      <SiteHeader />

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
                key={category.id}
                className={`category-card ${
                  selectedCategory === category.name ? "selected" : ""
                }`}
                onClick={() => setSelectedCategory(category.name)}
                aria-pressed={selectedCategory === category.name}
              >
                <span
                  className={`category-symbol symbol-${
                    category.name === "Todos"
                      ? "all"
                      : category.style || "care"
                  }`}
                >
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
              {loading
                ? "Cargando..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "producto" : "productos"
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
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
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
          ) : filteredProducts.length > 0 ? (
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
                            `${product.name}\n${product.description}\nPrecio: ${formatPrice(product.price)}\nStock disponible: ${product.stock}\n${
                              product.requiereFormula
                                ? "Requiere fórmula médica."
                                : "Consulta las indicaciones de uso."
                            }`
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
              <p>
                Prueba con otro nombre o selecciona una categoría diferente.
              </p>
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
              Explora nuestro catálogo y descubre opciones para tu rutina diaria.
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

export default HomePage;
