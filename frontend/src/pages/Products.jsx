import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

// Skeleton loaders...
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden animate-pulse shrink-0 w-52 h-full flex flex-col">
      <div className="w-full h-40 bg-gray-200" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="mt-2 h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded-full mt-auto" />
      </div>
    </div>
  );
}

// AI recommendations render disabled in the standard grid since user wants Amazon grid.
// But we keep the function returning null or a premium strip if requested later.

export default function Products() {
  const [searchParams] = useSearchParams();
  const {
    products, isLoading,
    fetchRecommendations, fetchProducts,
    fetchAllRecommendations,
    multiRecs, minRating, maxPrice,
    sortBy, setSortBy,
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
  }, [searchParams]);

  // Client-side filter + sort
  const { filteredGrid } = useMemo(() => {
    const filterFn = (p) => {
      const r = Number(p.avg_rating);
      const pr = Number(p.final_price);

      if (minRating && r < minRating) return false;
      if (maxPrice && pr > maxPrice) return false;

      return true;
    };

    const sortFn = (a, b) => {
      if (sortBy === "price_asc")  return a.final_price - b.final_price;
      if (sortBy === "price_desc") return b.final_price - a.final_price;
      if (sortBy === "rating")     return b.avg_rating - a.avg_rating;
      return 0; // relevance
    };

    return {
      filteredGrid: [...products].filter(filterFn).sort(sortFn),
    };
  }, [products, multiRecs, minRating, maxPrice, sortBy]);

  return (
    <div className="bg-amz-bg min-h-screen text-amz-text flex justify-center">
      <div className="w-full max-w-[1500px] flex gap-6 p-4 sm:p-6">
        
        {/* Left Sidebar Filters */}
        <aside className="w-64 hidden md:block shrink-0 border-r border-gray-200">
          <FilterSidebar />
        </aside>

        {/* Main Product Area */}
        <main className="flex-1 min-w-0">
          {/* Top Bar (Results count & Sort) */}
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-sm font-bold text-amz-text">
              1-{filteredGrid.length} of over {products.length} results
            </h1>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-gray-100 border border-gray-300 rounded-md py-1.5 px-3 hover:bg-gray-200 focus:ring-1 focus:ring-amz-accent focus:border-amz-accent outline-none cursor-pointer"
              >
                <option value="relevance">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            filteredGrid.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredGrid.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-md border border-gray-200 text-center shadow-sm">
                <h2 className="text-xl font-bold mb-2">No results for your filters.</h2>
                <p className="text-gray-600 mb-4">Try checking your spelling or use more general terms, or adjust the price/rating filters.</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
