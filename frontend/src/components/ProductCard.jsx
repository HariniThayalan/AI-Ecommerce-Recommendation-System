import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useStore } from "../store/useStore";
import StarRating from "./StarRating";

export default function ProductCard({ product, showMatchScore = false }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistIds } = useStore();
  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <div
      className="bg-bg-card border border-primary/20 rounded-2xl overflow-hidden
                 cursor-pointer card-hover group relative flex flex-col"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* AI Match badge */}
      {showMatchScore && product.match_score && (
        <div className="absolute top-3 left-3 z-10 bg-grad-primary
                        text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
          {product.match_score}
        </div>
      )}

      {/* Wishlist heart */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-bg-base/70
                   backdrop-blur-sm transition-colors hover:bg-bg-base"
      >
        <Heart
          size={16}
          className={isWishlisted ? "fill-secondary text-secondary" : "text-muted"}
        />
      </button>

      {/* Image */}
      <div className="w-full h-48 overflow-hidden bg-bg-surface shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${product.id}/400/300`;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-[11px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-[11px] bg-bg-surface text-muted px-2 py-0.5 rounded-full">
              {product.brand}
            </span>
          )}
        </div>

        {/* Name */}
        <p className="text-white text-sm font-semibold line-clamp-2 leading-snug">
          {product.name}
        </p>

        {/* Rating */}
        <StarRating rating={product.avg_rating} count={product.review_count} />

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
          <span className="text-primary font-bold text-lg">
            {product.final_price_display}
          </span>
          {product.discount_percent > 0 && (
            <>
              <span className="text-muted text-sm line-through">
                {product.price_display}
              </span>
              <span className="text-accent text-[11px] font-semibold bg-accent/10
                               px-2 py-0.5 rounded-full">
                {product.discount_display}
              </span>
            </>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold
                     bg-grad-primary text-white hover:opacity-90 transition-opacity
                     flex items-center justify-center gap-2"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
