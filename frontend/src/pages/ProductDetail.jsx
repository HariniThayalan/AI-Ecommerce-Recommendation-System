import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, Heart, Truck } from "lucide-react";
import { getProduct, getContentRecs } from "../api/client";
import { useStore } from "../store/useStore";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";

const TABS = ["Overview", "Description", "Specifications"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistIds } = useStore();

  const [product,   setProduct]   = useState(null);
  const [similarProds, setSimilar] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [qty,       setQty]       = useState(1);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    Promise.all([getProduct(id), getContentRecs(id, 8)])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data);
        setSimilar(rRes.data.recommendations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full
                          animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-white mb-4">Product not found</p>
          <button onClick={() => navigate("/products")}
            className="px-6 py-2.5 bg-grad-primary text-white rounded-xl font-semibold">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <div className="bg-bg-base min-h-screen text-white pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        {/* Breadcrumb */}
        <nav className="text-muted text-sm mb-6">
          <button onClick={() => navigate("/products")} className="hover:text-primary">Products</button>
          <span className="mx-2">/</span>
          <span className="text-white line-clamp-1">{product.name}</span>
        </nav>

        {/* Main section */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* Image */}
          <div className="md:w-[45%] shrink-0">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-bg-surface">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full object-cover aspect-square"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/600/600`; }}
              />
            </div>
            {/* Thumbnail strip (same image × 4 until real multi-image support) */}
            <div className="flex gap-2 mt-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10
                                        hover:border-primary cursor-pointer transition-colors">
                  <img src={product.image_url} alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}${i}/150/150`; }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-xs bg-bg-surface text-muted px-3 py-1 rounded-full">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

            <StarRating rating={product.avg_rating} count={product.review_count} size="lg" />

            <hr className="border-white/10" />

            {/* Price */}
            <div className="flex items-end gap-4 flex-wrap">
              <span className="text-4xl font-black text-primary">
                {product.final_price_display}
              </span>
              {product.discount_percent > 0 && (
                <>
                  <span className="text-muted text-xl line-through">{product.price_display}</span>
                  <span className="bg-accent/15 text-accent text-sm font-bold px-3 py-1 rounded-full">
                    {product.discount_display}
                  </span>
                </>
              )}
            </div>

            <p className="text-muted text-sm leading-relaxed">{product.description}</p>

            {/* Quantity stepper */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Qty:</span>
              <div className="flex items-center border border-white/20 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 hover:bg-white/5 text-muted hover:text-white text-lg leading-none">
                  −
                </button>
                <span className="px-4 py-2 font-bold min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                  className="px-4 py-2 hover:bg-white/5 text-muted hover:text-white text-lg leading-none">
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6
                           bg-grad-primary text-white rounded-2xl font-bold
                           hover:opacity-90 transition-opacity min-w-[140px]"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                onClick={() => { addToCart(product); navigate("/checkout"); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6
                           bg-gradient-to-r from-secondary to-pink-600 text-white
                           rounded-2xl font-bold hover:opacity-90 transition-opacity min-w-[140px]"
              >
                <Zap size={18} /> Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-2xl border-2 transition-colors
                  ${isWishlisted ? "border-secondary bg-secondary/10" : "border-white/20 hover:border-secondary"}`}
              >
                <Heart size={20} className={isWishlisted ? "fill-secondary text-secondary" : "text-muted"} />
              </button>
            </div>

            {/* Delivery note */}
            <div className="flex items-center gap-2 text-accent text-sm">
              <Truck size={16} /><span>Free delivery · Arrives in 3–5 business days</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-white/10">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px
                  ${activeTab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="py-6 text-muted text-sm leading-relaxed max-w-3xl">
            {product.description || "No additional information available."}
          </div>
        </div>

        {/* Similar Products */}
        {similarProds.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-6">🧠 AI Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {similarProds.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} showMatchScore />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
