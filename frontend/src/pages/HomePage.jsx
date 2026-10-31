// Página pública de inicio (/). Solo organiza las secciones de la portada;
// cada sección vive en su propio componente dentro de components/home y la
// lógica del catálogo está en hooks/useCatalog.js.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AboutSection from "../components/home/AboutSection.jsx";
import AnnouncementBar from "../components/home/AnnouncementBar.jsx";
import CareBanner from "../components/home/CareBanner.jsx";
import CatalogSection from "../components/home/CatalogSection.jsx";
import CategoriesSection from "../components/home/CategoriesSection.jsx";
import FaqSection from "../components/home/FaqSection.jsx";
import FeaturesSection from "../components/home/FeaturesSection.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import PromoCarousel from "../components/home/PromoCarousel.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import useCatalog from "../hooks/useCatalog.js";

function HomePage() {
  const catalog = useCatalog();
  const { hash, key } = useLocation();

  // Salto a la sección del ancla (#productos, #preguntas...) en cada
  // navegación que la incluya: al llegar desde otra página y al elegir una
  // opción de los submenús de la cabecera (/?categoria=...#productos) estando
  // ya en la portada. Se espera a que cargue el catálogo, porque antes la
  // página aún no tiene su altura final y el salto quedaría corto.
  // scroll-padding-top (header.css) deja la sección debajo de la cabecera fija.
  useEffect(() => {
    if (catalog.loading || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [catalog.loading, hash, key]);

  return (
    <div className="app-shell">
      <AnnouncementBar />
      <SiteHeader />

      <main>
        <HeroSection />
        <PromoCarousel />
        <FeaturesSection />

        <CategoriesSection
          categories={catalog.categories}
          selectedCategory={catalog.selectedCategory}
          onSelectCategory={catalog.setSelectedCategory}
        />

        <CatalogSection
          categories={catalog.categories}
          products={catalog.filteredProducts}
          loading={catalog.loading}
          error={catalog.error}
          search={catalog.search}
          onSearchChange={catalog.setSearch}
          selectedCategory={catalog.selectedCategory}
          onSelectCategory={catalog.setSelectedCategory}
          productView={catalog.productView}
          onProductViewChange={catalog.setProductView}
          sortBy={catalog.sortBy}
          onSortChange={catalog.setSortBy}
          onResetFilters={catalog.resetFilters}
        />

        <AboutSection />
        <FaqSection />
        <CareBanner />
      </main>

      <SiteFooter />
    </div>
  );
}

export default HomePage;
