// Estado y lógica del catálogo: carga productos y categorías (api/catalog.js:
// del backend o, en el modo demostración, de data/productos.js),
// los adapta para la vista y aplica la búsqueda, el filtro por categoría y el orden.
// Lo usa HomePage para compartir el estado entre CategoriesSection y
// CatalogSection.
// La categoría y el tipo de producto elegidos se guardan en la URL
// (/?categoria=Medicamentos&ver=con-formula). Así los submenús de la cabecera
// pueden abrir el catálogo ya filtrado desde cualquier página, y el enlace se
// puede compartir o recargar sin perder el filtro.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCatalog } from "../api/catalog.js";
import { USAR_BACKEND } from "../api/config.js";
import { ilustracionDe } from "../utils/ilustraciones.js";

// Color del punto de cada categoría en los filtros del catálogo (mismo color
// que el fondo de sus productos: clases .art-* en app.css)
const categoryColors = {
  "Medicamentos": "blue",
  "Cuidado personal": "mint",
  "Vitaminas y suplementos": "orange",
  "Primeros auxilios": "green",
};

// Color de fondo de la ilustración de cada producto, según el id de su
// categoría (clases .art-blue, .art-mint... en app.css). El dibujo lo elige
// utils/ilustraciones.js.
const productColors = {
  1: "blue",
  2: "mint",
  3: "orange",
  4: "green",
};

export const ALL_CATEGORIES = "Todos";

// Texto en minúsculas y sin tildes, para que la búsqueda "acetaminofen"
// encuentre "Acetaminofén". normalize("NFD") separa cada letra de su tilde
// y el reemplazo elimina las tildes sueltas (rango Unicode U+0300–U+036F).
const normalizeText = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

// Etiqueta de la tarjeta: lo agotado tiene prioridad sobre la fórmula
const productLabel = (soldOut, requiereFormula) => {
  if (soldOut) return "Agotado";
  return requiereFormula ? "Con fórmula" : "Disponible";
};

// Tipos de producto del submenú "Productos" de la cabecera y del filtro
// "Mostrar" del catálogo (clave en la URL -> texto y condición)
export const PRODUCT_VIEWS = {
  todos: { label: "Todos los productos", matches: () => true },
  "sin-formula": {
    label: "Venta libre (sin fórmula)",
    matches: (product) => !product.requiereFormula,
  },
  "con-formula": {
    label: "Con fórmula médica",
    matches: (product) => product.requiereFormula,
  },
  disponibles: {
    label: "Disponibles ahora",
    matches: (product) => !product.soldOut,
  },
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("relevancia");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros leídos de la URL; un valor desconocido se trata como "sin filtro"
  const selectedCategory = searchParams.get("categoria") || ALL_CATEGORIES;
  const viewParam = searchParams.get("ver");
  const productView = PRODUCT_VIEWS[viewParam] ? viewParam : "todos";

  // Cambia un parámetro de la URL sin añadir una entrada al historial; el
  // valor por defecto se quita para que la URL quede limpia.
  const updateParam = (key, value, defaultValue) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (!value || value === defaultValue) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );
  };

  const setSelectedCategory = (category) =>
    updateParam("categoria", category, ALL_CATEGORIES);
  const setProductView = (view) => updateParam("ver", view, "todos");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError("");

        const { productos: productsData, categorias: categoriesData } =
          await getCatalog();

        // Se pasan los campos de la API (en español) a los nombres que usan
        // los componentes, y se añaden el color y el dibujo de la tarjeta
        const normalizedProducts = productsData.map((product) => {
          const categoryId = Number(product.categoria_id);
          const stock = Number(product.stock);
          const soldOut = !(stock > 0);
          const requiereFormula = Boolean(product.requiere_formula);

          return {
            id: product.id,
            name: product.nombre,
            description: product.descripcion || "Sin descripción disponible",
            category: product.categoria || "Sin categoría",
            categoryId,
            price: Number(product.precio),
            stock,
            soldOut,
            color: productColors[categoryId] || "green",
            ilustracion: ilustracionDe(product.nombre, product.categoria),
            label: productLabel(soldOut, requiereFormula),
            requiereFormula,
          };
        });

        // "Todos" va primero: es la opción que quita el filtro. Cada
        // categoría lleva cuántos productos tiene.
        const normalizedCategories = [
          {
            id: ALL_CATEGORIES,
            name: ALL_CATEGORIES,
            color: null,
            count: normalizedProducts.length,
          },
          ...categoriesData.map((category) => ({
            id: category.id,
            name: category.nombre,
            color: categoryColors[category.nombre] || "green",
            count: normalizedProducts.filter(
              (product) => product.categoryId === Number(category.id)
            ).length,
          })),
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

  // Productos que se muestran: búsqueda (nombre, descripción o categoría,
  // sin importar mayúsculas ni tildes) + categoría + tipo de producto + orden.
  // useMemo solo recalcula si cambia alguno.
  const filteredProducts = useMemo(() => {
    const query = normalizeText(search.trim());

    const filtered = products.filter((product) => {
      const matchesSearch = [product.name, product.description, product.category]
        .some((text) => normalizeText(text).includes(query));

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        product.category === selectedCategory;

      const matchesView = PRODUCT_VIEWS[productView].matches(product);

      return matchesSearch && matchesCategory && matchesView;
    });

    // sort ordena una copia para no alterar el orden original
    const compare = SORT_OPTIONS[sortBy].compare;
    return compare ? [...filtered].sort(compare) : filtered;
  }, [products, search, selectedCategory, productView, sortBy]);

  // Quita la búsqueda y el filtro (botón "Ver todos los productos")
  const resetFilters = () => {
    setSearch("");
    setSearchParams({}, { replace: true });
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
    productView,
    setProductView,
    sortBy,
    setSortBy,
    resetFilters,
  };
}

export default useCatalog;
