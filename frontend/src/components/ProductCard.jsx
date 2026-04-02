import { useStore } from "../store/useStore";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ product, showMatchScore = false }) {
  const addToCart = useStore((state) => state.addToCart);
  
  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden card-hover h-full flex flex-col group">

      {/* Image Section */}
      <Link to={`/product/${product.id}`} className="relative bg-gray-50 flex items-center justify-center p-4 h-48 overflow-hidden">
        <img
          src={
            product.image_url ||
            product.image ||
            product.thumbnail ||
            product.img ||
            "https://via.placeholder.com/200"
          }
          alt={product.name}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200";
          }}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
        {showMatchScore && product.matchScore && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(product.matchScore * 100)}% Match
          </div>
        )}
      </Link>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="hover:text-amz-linkHover group">
          <h2 className="text-sm font-medium line-clamp-2 text-amz-text h-10 group-hover:underline">
            {product.name}
          </h2>
        </Link>

        {/* Ratings */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center text-amz-accent">
            <Star size={14} fill="currentColor" />
            <span className="text-amz-link text-xs ml-1 font-bold">{product.avg_rating || "4.0"}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-2 text-amz-text flex items-baseline gap-1">
          <span className="text-xs">₹</span>
          <span className="text-2xl font-medium tracking-tight leading-none">{Math.floor(product.final_price)}</span>
          <span className="text-xs leading-none">{(product.final_price % 1).toFixed(2).substring(1)}</span>
        </div>
        
        {/* Prime / Badges (Optional Mock) */}
        <div className="text-xs text-gray-500 font-medium mt-1 mb-3">
          Get it by Tomorrow
        </div>

        {/* Button - anchors to bottom */}
        <div className="mt-auto">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-1.5 px-3 rounded-full btn-amazon text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}