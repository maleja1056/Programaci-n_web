// Indica qué sección de la portada se está viendo, para marcar su enlace en
// la cabecera (Inicio, Categorías o Productos) mientras se desplaza la página.
// Con enabled = false (fuera de la portada) devuelve null.
import { useEffect, useState } from "react";

function useActiveSection(sectionIds, enabled) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    if (!enabled) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      // Una sección cuenta como activa cuando su borde superior pasa por una
      // línea situada bajo la cabecera fija, a un cuarto de la ventana.
      const header = document.querySelector(".site-header");
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const line = headerBottom + window.innerHeight * 0.25;

      let current = sectionIds[0];
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) {
          current = id;
        }
      }

      // Al llegar al final de la página se marca la última sección
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = sectionIds[sectionIds.length - 1];

      setActiveId(current);
    };

    // Se calcula como mucho una vez por fotograma
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionIds, enabled]);

  return enabled ? activeId : null;
}

export default useActiveSection;
