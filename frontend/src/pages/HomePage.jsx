// Página pública de inicio (/). Solo organiza las secciones de la portada;
// cada sección vive en su propio componente dentro de components/home y la
// lógica del catálogo está en hooks/useCatalog.js.
import AnnouncementBar from "../components/home/AnnouncementBar.jsx";
import CareBanner from "../components/home/CareBanner.jsx";
import CatalogSection from "../components/home/CatalogSection.jsx";
import CategoriesSection from "../components/home/CategoriesSection.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import useCatalog from "../hooks/useCatalog.js";

function HomePage() {
  const catalog = useCatalog();

  return (
    <div className="app-shell">
      <AnnouncementBar />
      <SiteHeader />

      <main>
        <HeroSection />

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
          onResetFilters={catalog.resetFilters}
        />

        <CareBanner />
      </main>

      <SiteFooter />
    </div>
  );
}

export default HomePage;
