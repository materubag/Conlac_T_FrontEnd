import { HomeManager } from "@/components/home/HomeManager";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { homeDefaults } from "@/lib/homeDefaults";
import { getStorePageData, selectHomeProducts } from "@/lib/server/storeCatalog";
import { getHomeAccessCards, getHomeTestimonials } from "@/lib/server/homeContent";
import type { HomeContent } from "@/types/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialConfig = obtenerPaginaConfig<HomeContent>("home", homeDefaults);
  const [store, cards, testimonials] = await Promise.all([
    getStorePageData(), getHomeAccessCards(), getHomeTestimonials(),
  ]);
  return <HomeManager initialConfig={initialConfig} products={selectHomeProducts(store.products)} cards={cards} testimonials={testimonials} />;
}
