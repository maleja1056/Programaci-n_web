// Categorías para el submenú "Categorías" de la cabecera, con el número de
// productos de cada una. Usa el mismo catálogo que la portada (api/catalog.js
// lo guarda en memoria, así que no se repite la petición). Si el catálogo no
// carga, devuelve una lista vacía y el submenú solo muestra "Ver todas".
import { useEffect, useState } from "react";
import { getCatalog } from "../api/catalog.js";

function useCategoryMenu() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;

    getCatalog()
      .then(({ productos, categorias }) => {
        if (!active) return;
        setCategories(
          categorias.map((categoria) => ({
            id: categoria.id,
            name: categoria.nombre,
            count: productos.filter(
              (producto) => Number(producto.categoria_id) === Number(categoria.id)
            ).length,
          }))
        );
      })
      .catch(() => {
        // El error ya lo muestra el catálogo de la portada
      });

    return () => {
      active = false;
    };
  }, []);

  return categories;
}

export default useCategoryMenu;
