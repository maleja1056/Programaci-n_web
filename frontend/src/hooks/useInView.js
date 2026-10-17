// Indica si un elemento ya apareció en pantalla al desplazarse. Se usa para
// mostrar secciones con el efecto Fade cuando el usuario llega a ellas.
// Devuelve [ref, visible]: la ref se pone en el elemento a observar.
import { useEffect, useRef, useState } from "react";

function useInView() {
  const ref = useRef(null);
  // Navegadores sin IntersectionObserver: se muestra directamente
  const [visible, setVisible] = useState(
    () => !("IntersectionObserver" in window)
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // solo se anima la primera vez
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export default useInView;
