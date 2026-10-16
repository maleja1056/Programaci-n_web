// Estado y lógica del catálogo: carga productos y categorías desde el backend,
// los adapta para la vista y aplica la búsqueda y el filtro por categoría.
// Lo usa HomePage para compartir el estado entre CategoriesSection y
// CatalogSection.
import { useEffect, useMemo, useState } from "react";

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

function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
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
        selectedCategory === ALL_CATEGORIES ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // Quita la búsqueda y el filtro (botón "Ver todos los productos")
  const resetFilters = () => {
    setSearch("");
    setSelectedCategory(ALL_CATEGORIES);
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
    resetFilters,
  };
}

export default useCatalog;
