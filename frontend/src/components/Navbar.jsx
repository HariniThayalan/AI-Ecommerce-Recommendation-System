import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems, wishlistIds, isLoggedIn, userName } = useStore();
  const cartCount     = cartItems.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlistIds.length;

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-xl border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <ShoppingBag className="text-primary" size={24} />
            <span className="font-black text-xl text-white tracking-tight">
              Shop<span className="grad-text">Smart AI</span>
            </span>
          </Link>

          {/* Search — hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands…"
              className="w-full bg-bg-surface border border-white/15 rounded-full
                         pl-9 pr-4 py-2 text-sm text-white placeholder-muted
                         focus:outline-none focus:border-primary transition-colors"
            />
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Wishlist */}
            <Link to="/profile" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Heart size={20} className="text-muted hover:text-secondary transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px]
                                 font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ShoppingCart size={20} className="text-muted hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px]
                                 font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isLoggedIn ? (
              <Link to="/profile"
                className="w-9 h-9 rounded-full bg-grad-primary flex items-center
                           justify-center text-white font-bold text-sm shrink-0">
                {userName[0]?.toUpperCase()}
              </Link>
            ) : (
              <Link to="/profile"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                           bg-grad-primary text-white text-sm font-semibold hover:opacity-90
                           transition-opacity">
                <User size={15} /> Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search + nav */}
        {menuOpen && (
          <div className="pb-4 md:hidden flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-bg-surface border border-white/15 rounded-full
                           pl-9 pr-4 py-2 text-sm text-white placeholder-muted
                           focus:outline-none focus:border-primary"
              />
            </form>
            <div className="flex gap-3 text-sm text-muted">
              <Link to="/products" onClick={() => setMenuOpen(false)} className="hover:text-white">Products</Link>
              <Link to="/cart"     onClick={() => setMenuOpen(false)} className="hover:text-white">Cart</Link>
              <Link to="/profile"  onClick={() => setMenuOpen(false)} className="hover:text-white">Profile</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
