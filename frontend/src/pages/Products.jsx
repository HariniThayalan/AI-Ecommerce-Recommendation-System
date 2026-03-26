import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

const SORT_OPTIONS = [
  { val: "relevance",  label: "Relevance" },
  { val: "price_asc",  label: "Price: Low → High" },
  { val: "price_desc", label: "Price: High → Low" },
  { val: "rating",     label: "Top Rated" },
];

const AI_SECTIONS = [
  {
    key: "content",
    emoji: "🧠",
    label: "Content-Based Picks",
    desc: "Similar to what you've been viewing — powered by TF-IDF tag similarity",
    gradient: "from-violet-500/20 to-purple-900/10",
    border: "border-violet-500/30",
    badge: "bg-violet-500/20 text-violet-300",
  },
  {
    key: "collaborative",
    emoji: "👥",
    label: "Users Like You Also Bought",
    desc: "Collaborative filtering — based on purchase patterns of similar shoppers",
    gradient: "from-cyan-500/20 to-blue-900/10",
    border: "border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-300",
  },
  {
    key: "hybrid",
    emoji: "⚡",
    label: "Hybrid AI Recommendations",
    desc: "Best of all engines — combined content + collaborative intelligence",
    gradient: "from-amber-500/20 to-orange-900/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300",
  },
];

function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden animate-pulse shrink-0 w-52">
      <div className="w-full h-36 bg-bg-surface" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-bg-surface rounded w-1/2" />
        <div className="h-4 bg-bg-surface rounded w-3/4" />
        <div className="h-3 bg-bg-surface rounded w-1/3" />
        <div className="h-8 bg-bg-surface rounded-xl mt-1" />
      </div>
    </div>
  );
}

function SkeletonGridCard() {
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

/** Horizontally-scrollable AI recommendation row */
function AiSection({ section, items, loading }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <div className={`rounded-2xl border ${section.border} bg-gradient-to-r ${section.gradient} p-5 mb-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${section.badge}`}>
              {section.emoji} AI ENGINE
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">{section.label}</h2>
          <p className="text-muted text-xs mt-0.5">{section.desc}</p>
        </div>
        {/* Scroll arrows (desktop) */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollbarWidth: "thin" }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.length === 0
          ? (
            <div className="text-muted text-sm py-6 px-4">
              No recommendations available — try browsing more products first.
            </div>
          )
          : items.map((p) => (
            <div key={p.id} className="shrink-0 w-52">
              <ProductCard product={p} showMatchScore />
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const {
    products, isLoading,
    fetchRecommendations, fetchProducts,
    fetchAllRecommendations,
    multiRecs, multiRecsLoading,
    minRating, maxPrice, sortBy, setSortBy,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load on mount — respect URL params
  useEffect(() => {
    const q   = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q) {
      fetchProducts({ q });
      useStore.getState().addToSearchHistory(q);
    }
    else if (cat) fetchProducts({ category: cat });
    else          fetchRecommendations("top_rated");

    // Always auto-load all AI sections
    fetchAllRecommendations();
  }, []);

  // Client-side filter + sort
  const { filteredGrid, filteredMulti } = useMemo(() => {
    const filterFn = (p) => {
      const r = Number(p.avg_rating || 0);
      const pr = Number(p.final_price || 0);
      if (minRating > 0 && r < minRating) return false;
      if (maxPrice < 10000 && pr > maxPrice) return false;
      return true;
    };

    const sortFn = (a, b) => {
      if (sortBy === "price_asc")  return a.final_price - b.final_price;
      if (sortBy === "price_desc") return b.final_price - a.final_price;
      if (sortBy === "rating")     return b.avg_rating - a.avg_rating;
      return 0;
    };

    return {
      filteredGrid: [...products].filter(filterFn).sort(sortFn),
      filteredMulti: {
        content:       (multiRecs.content || []).filter(filterFn),
        collaborative: (multiRecs.collaborative || []).filter(filterFn),
        hybrid:        (multiRecs.hybrid || []).filter(filterFn),
      }
    };
  }, [products, multiRecs, minRating, maxPrice, sortBy]);

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">All Products</h1>
            <p className="text-muted text-sm mt-0.5">{filteredGrid.length} products found</p>
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

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* ── Main Product Grid ── */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonGridCard key={i} />)}
              </div>
            ) : filteredGrid.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-white mb-2">No products found</p>
                <p className="text-muted">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                {filteredGrid.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* ── AI Recommendation Sections (auto-loaded) ── */}
            <div className="mt-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm font-bold text-muted uppercase tracking-widest px-3">
                  🤖 Personalised For You
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {AI_SECTIONS.map((section) => (
                <AiSection
                  key={section.key}
                  section={section}
                  items={filteredMulti[section.key]}
                  loading={multiRecsLoading}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
