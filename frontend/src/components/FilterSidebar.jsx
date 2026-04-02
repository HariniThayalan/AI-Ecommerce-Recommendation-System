import { useStore } from "../store/useStore";
import { Star } from "lucide-react";

export default function FilterSidebar() {
  const {
    minRating,
    setMinRating,
    maxPrice,
    setMaxPrice,
  } = useStore();

  return (
    <div className="bg-transparent pr-4 w-full h-full">

      <h2 className="font-bold text-gray-900 mb-4">Filters</h2>

      {/* Customer Rating */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Reviews</h3>
        <div className="flex flex-col gap-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`flex items-center gap-1 text-sm hover:text-[#F3A847] transition-colors ${minRating === rating ? 'text-[#FEBD69] font-bold' : 'text-gray-900'}`}
            >
              <div className="flex items-center text-[#FEBD69]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < rating ? "currentColor" : "transparent"} className={i < rating ? "text-[#FEBD69]" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-[#007185] hover:text-[#C40000] ml-1">& Up</span>
            </button>
          ))}
          <button
            onClick={() => setMinRating(0)}
            className={`text-sm text-left hover:text-[#C40000] transition-colors ${minRating === 0 ? 'text-[#007185] font-bold' : 'text-[#007185]'}`}
          >
            Clear rating filter
          </button>
        </div>
      </div>

      {/* PRICE */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Price</h3>
        <div className="text-sm font-bold text-gray-900 mb-2">
          Up to ₹{maxPrice}
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#FEBD69] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₹0</span>
          <span>₹10K+</span>
        </div>
      </div>

    </div>
  );
}