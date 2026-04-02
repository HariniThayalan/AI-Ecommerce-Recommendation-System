import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { getOrders } from "../api/client";
import { useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";
import { Package, Heart, Settings, LogOut } from "lucide-react";

export default function Profile() {
  const { isLoggedIn, logout, userName, userEmail, userId, wishlistIds, products, fetchProducts, orders, setOrders } = useStore();
  const [activeMenu, setActiveMenu] = useState("Your Orders");
  const [wishProds, setWishProds] = useState([]);

  useEffect(() => {
    if (isLoggedIn) getOrders(userId).then((r) => setOrders(r.data || [])).catch(() => {});
  }, [isLoggedIn, userId, setOrders]);

  useEffect(() => { if (products.length === 0) fetchProducts(); }, []);
  useEffect(() => { setWishProds(products.filter((p) => wishlistIds.includes(p.id))); }, [wishlistIds, products]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch(activeMenu) {
      case "Your Orders":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
            {orders.length === 0 ? (
              <div className="border border-gray-200 rounded p-6 text-center bg-gray-50">
                <Package className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
                <Link to="/products" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium">Continue Shopping</Link>
              </div>
            ) : orders.map((o) => (
              <div key={o.order_id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between text-sm text-gray-600">
                  <div>
                    <span className="block uppercase text-xs">Order Placed</span>
                    <span className="font-bold text-gray-900">{o.date || "Recently"}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-xs">Total</span>
                    <span className="font-bold text-gray-900">₹{o.grand_total?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                  </div>
                  <div className="text-right">
                    <span className="block uppercase text-xs">Order # {o.order_id}</span>
                    <span className="text-amz-link hover:underline cursor-pointer">View order details</span>
                  </div>
                </div>
                <div className="p-4 bg-white flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-green-700 text-lg mb-1">{o.status === "Confirmed" ? "Arriving soon" : o.status}</h3>
                    <p className="text-sm text-gray-600">{o.items?.length || 0} items purchased</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-50 text-sm font-medium">
                    Track package
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case "Your Wishlist":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
            {wishProds.length === 0 ? (
              <div className="border border-gray-200 rounded p-6 text-center bg-gray-50">
                <Heart className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
                <Link to="/products" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium">Discover Products</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishProds.map((p) => <div className="h-64"><ProductCard key={p.id} product={p} /></div>)}
              </div>
            )}
          </div>
        );
      case "Login & Security":
        return (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Login & Security</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-bold">Name</h3>
                  <p className="text-sm text-gray-600">{userName}</p>
                </div>
                <button className="px-4 py-1.5 border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-100 text-sm font-medium">Edit</button>
              </div>
              <div className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
                <button className="px-4 py-1.5 border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-100 text-sm font-medium">Edit</button>
              </div>
            </div>
            <button onClick={logout} className="mt-6 px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded shadow-sm hover:bg-red-100 font-medium text-sm flex items-center gap-2">
              <LogOut size={16} /> Sign Out of All Devices
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-normal mb-8">Your Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Menu */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
            {["Your Orders", "Your Wishlist", "Login & Security"].map((menu) => (
              <button
                key={menu}
                onClick={() => setActiveMenu(menu)}
                className={`text-left px-4 py-3 rounded border hover:bg-gray-100 transition-colors shadow-sm ${
                  activeMenu === menu 
                    ? "bg-gray-100 border-gray-300 font-bold border-l-4 border-l-amz-accent" 
                    : "bg-white border-transparent text-gray-700 font-medium"
                }`}
              >
                {menu}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-h-[500px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
