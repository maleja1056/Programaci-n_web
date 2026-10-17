// Estado y lógica del catálogo: carga productos y categorías (api/catalog.js:
// del backend o, en el modo demostración, de data/productos.js),
// los adapta para la vista y aplica la búsqueda, el filtro por categoría y el orden.
// Lo usa HomePage para compartir el estado entre CategoriesSection y
// CatalogSection.
import { useEffect, useMemo, useState } from "react";
import { getCatalog } from "../api/catalog.js";
import { USAR_BACKEND } from "../api/config.js";

// Símbolo y estilo de cada categoría en las tarjetas de categorías
const categoryVisuals = {
  "Medicamentos": { symbol: "+", style: "medicines" },
  "Cuidado personal": { symbol: "◇", style: "care" },
  "Vitaminas y suplementos": { symbol: "✳", style: "vitamins" },
  "Primeros auxilios": { symbol: "+", style: "first-aid" },
};

// Color y símbolo de la ilustración de cada producto, según su categoría
const productVisuals = {
  1: { color: "blue", symbol: "+" },
  2: { color: "mint", symbol: "◇" },
  3: { color: "orange", symbol: "C" },
  4: { color: "green", symbol: "+" },
};

export const ALL_CATEGORIES = "Todos";

// Opciones del menú "Ordenar por" (clave -> texto y función de comparación)
export const SORT_OPTIONS = {
  relevancia: { label: "Relevancia", compare: null },
  "precio-asc": { label: "Precio: menor a mayor", compare: (a, b) => a.price - b.price },
  "precio-desc": { label: "Precio: mayor a menor", compare: (a, b) => b.price - a.price },
  nombre: { label: "Nombre (A-Z)", compare: (a, b) => a.name.localeCompare(b.name, "es") },
};

function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [sortBy, setSortBy] = useState("relevancia");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError("");

        const { productos: productsData, categorias: categoriesData } =
          await getCatalog();

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
            id: ALL_CATEGORIES,
            name: ALL_CATEGORIES,
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
          USAR_BACKEND
            ? "No fue posible conectar con el catálogo. Comprueba que el backend y MySQL estén funcionando e inténtalo de nuevo."
            : "No fue posible cargar el catálogo. Recarga la página e inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");

    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLocaleLowerCase("es").includes(query) ||
        product.description.toLocaleLowerCase("es").includes(query) ||
        product.category.toLocaleLowerCase("es").includes(query);

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // sort ordena una copia para no alterar el orden original
    const compare = SORT_OPTIONS[sortBy].compare;
    return compare ? [...filtered].sort(compare) : filtered;
  }, [products, search, selectedCategory, sortBy]);

  // Quita la búsqueda y el filtro (botón "Ver todos los productos")
  const resetFilters = () => {
    setSearch("");
    setSelectedCategory(ALL_CATEGORIES);
    setSortBy("relevancia");
  };

  return {
    categories,
    filteredProducts,
    loading,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    resetFilters,
  };
}

export default useCatalog;
