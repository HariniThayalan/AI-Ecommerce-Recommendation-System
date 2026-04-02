import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, MapPin } from "lucide-react";
import { useStore } from "../store/useStore";
import { useState } from "react";

export default function Navbar() {
  const { cartCount, userName, isLoggedIn, logout } = useStore();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="flex flex-col w-full">
      {/* Top Tier: Primary Navbar */}
      <div className="bg-[#131921] text-white px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        
        {/* Logo */}
        <Link to="/" className="flex items-center p-1 sm:p-2 border border-transparent hover:border-white rounded shrink-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight">ShopSmart <span className="text-[#FEBD69] font-normal text-sm">.ai</span></span>
        </Link>

        {/* Location (Desktop) */}
        <div className="hidden lg:flex items-center p-2 border border-transparent hover:border-white rounded-sm cursor-pointer shrink-0">
          <MapPin size={18} className="mt-2 text-white" />
          <div className="ml-1 leading-tight">
            <div className="text-xs text-gray-300">Deliver to {userName}</div>
            <div className="text-sm font-bold">Your Location</div>
          </div>
        </div>

        {/* Search Bar - Center */}
        <div className="flex flex-1 min-w-[200px] h-10 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#FEBD69] order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
          <select className="hidden md:block bg-gray-100 text-gray-900 text-sm px-3 border-r border-gray-300 focus:outline-none hover:bg-gray-200 cursor-pointer">
            <option>All</option>
            <option>Electronics</option>
            <option>Fashion</option>
          </select>
          <form className="flex-1 flex" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search ShopSmart.ai"
              className="w-full px-4 text-gray-900 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-[#FEBD69] hover:bg-[#f3a847] px-4 flex items-center justify-center transition-colors cursor-pointer">
              <Search className="text-gray-900" size={20} />
            </button>
          </form>
        </div>

        {/* Right Section: Accounts & Lists */}
        <div className="flex items-center shrink-0">
          {isLoggedIn ? (
            <div className="flex flex-col items-start p-2 border border-transparent hover:border-white rounded-sm cursor-pointer" onClick={logout}>
              <span className="text-xs text-gray-300 leading-none">Hello, {userName}</span>
              <span className="text-sm font-bold leading-none flex items-center">Sign Out</span>
            </div>
          ) : (
            <Link to="/" className="flex flex-col items-start p-2 border border-transparent hover:border-white rounded-sm cursor-pointer">
              <span className="text-xs text-gray-300 leading-none">Hello, sign in</span>
              <span className="text-sm font-bold leading-none">Accounts & Lists</span>
            </Link>
          )}

          {/* Orders */}
          <Link to="/profile" className="hidden md:flex flex-col items-start p-2 border border-transparent hover:border-white rounded-sm">
            <span className="text-xs text-gray-300 leading-none">Returns</span>
            <span className="text-sm font-bold leading-none">& Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-end p-2 border border-transparent hover:border-white rounded-sm relative">
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-1 left-1/2 -ml-1 text-[#FEBD69] font-bold text-sm w-6 text-center">
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-bold hidden sm:block mt-1">Cart</span>
          </Link>
        </div>
      </div>

      {/* Bottom Tier: Sub-navigation */}
      <div className="bg-[#232F3E] text-white text-sm px-4 py-1.5 flex items-center gap-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="flex items-center gap-1 font-bold cursor-pointer border border-transparent hover:border-white p-1 rounded-sm">
          <Menu size={20} /> All
        </div>
        <Link to="/products" className="border border-transparent hover:border-white p-1 rounded-sm">Today's Deals</Link>
        <Link to="/products" className="border border-transparent hover:border-white p-1 rounded-sm">Customer Service</Link>
        <Link to="/products" className="border border-transparent hover:border-white p-1 rounded-sm">Registry</Link>
        <Link to="/products" className="border border-transparent hover:border-white p-1 rounded-sm">Gift Cards</Link>
        <Link to="/products" className="border border-transparent hover:border-white p-1 rounded-sm">Sell</Link>
      </div>
    </header>
  );
}