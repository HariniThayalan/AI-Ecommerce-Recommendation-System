import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

const SORT_OPTIONS = [
  { val: "relevance",  label: "Relevance" },
  { val: "price_asc",  label: "Price: Low → High" },
  { val: "price_desc", label: "Price: High → Low" },
  { val: "rating",     label: "Top Rated" },
];

function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-bg-surface" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-bg-surface rounded w-1/2" />
        <div className="h-4 bg-bg-surface rounded w-3/4" />
        <div className="h-3 bg-bg-surface rounded w-1/3" />
        <div className="h-10 bg-bg-surface rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const {
    products, isLoading, recMode,
    fetchRecommendations, fetchProducts,
    minRating, maxPrice, sortBy, setSortBy,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load on mount — respect URL params
  useEffect(() => {
    const q   = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q)   fetchProducts({ q });
    else if (cat) fetchProducts({ category: cat });
    else     fetchRecommendations("top_rated");
  }, []);

  // Client-side filter + sort
  const displayed = useMemo(() => {
    let list = [...products];
    if (minRating > 0)  list = list.filter((p) => p.avg_rating >= minRating);
    if (maxPrice < 10000) list = list.filter((p) => p.final_price <= maxPrice);
    if (sortBy === "price_asc")  list.sort((a, b) => a.final_price - b.final_price);
    if (sortBy === "price_desc") list.sort((a, b) => b.final_price - a.final_price);
    if (sortBy === "rating")     list.sort((a, b) => b.avg_rating - a.avg_rating);
    return list;
  }, [products, minRating, maxPrice, sortBy]);

  const aiMode = recMode !== "top_rated";

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {aiMode ? "AI Recommendations" : "All Products"}
            </h1>
            <p className="text-muted text-sm mt-0.5">
              {displayed.length} {aiMode ? "personalised results" : "products found"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-bg-surface
                         border border-white/15 rounded-xl text-sm text-white"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-bg-surface border border-white/15 rounded-xl px-4 py-2
                         text-sm text-white focus:outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.val} value={o.val}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <FilterSidebar />
          </div>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-bg-base rounded-t-3xl p-5
                              max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Filters</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X size={20} className="text-muted" />
                  </button>
                </div>
                <FilterSidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-white mb-2">No products found</p>
                <p className="text-muted">Try a different filter or AI mode</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayed.map((p) => (
                  <ProductCard key={p.id} product={p} showMatchScore={aiMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
