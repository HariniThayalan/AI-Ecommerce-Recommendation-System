import { useStore } from "../store/useStore";

const CATEGORIES = ["All", "Beauty", "Personal", "Health", "Household", "Food", "Sports"];
const RATINGS    = [{ label: "All",   val: 0 },
                    { label: "3★+",  val: 3 },
                    { label: "4★+",  val: 4 },
                    { label: "4.5★+",val: 4.5 }];

export default function FilterSidebar({ onClose }) {
  const {
    selectedCategory, setSelectedCategory, fetchProducts,
    minRating, setMinRating,
    maxPrice, setMaxPrice,
  } = useStore();

  const handleCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") fetchProducts();
    else fetchProducts({ category: cat });
    onClose?.();
  };

  return (
    <aside className="bg-bg-surface border border-white/10 rounded-2xl p-5
                      w-full md:w-64 md:shrink-0 flex flex-col gap-5 h-fit">

      {/* Category */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Category</h3>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors
                ${selectedCategory === cat
                  ? "bg-primary text-white font-semibold"
                  : "text-muted hover:text-white hover:bg-white/5"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Min Rating */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Min Rating</h3>
        <div className="flex flex-col gap-1">
          {RATINGS.map((r) => (
            <button
              key={r.val}
              onClick={() => setMinRating(r.val)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors
                ${minRating === r.val
                  ? "bg-primary text-white font-semibold"
                  : "text-muted hover:text-white hover:bg-white/5"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Max Price */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
          Max Price: <span className="text-primary">₹{maxPrice.toLocaleString()}</span>
        </h3>
        <input
          type="range" min={200} max={10000} step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>₹200</span><span>₹10,000</span>
        </div>
      </div>
    </aside>
  );
}
