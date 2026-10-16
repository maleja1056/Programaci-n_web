// Sección "Explora por categorías" (#categorias): una tarjeta por categoría
// que filtra el catálogo al pulsarla.
function CategoriesSection({ categories, selectedCategory, onSelectCategory }) {
  return (
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
            onClick={() => onSelectCategory(category.name)}
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
  );
}

export default CategoriesSection;
