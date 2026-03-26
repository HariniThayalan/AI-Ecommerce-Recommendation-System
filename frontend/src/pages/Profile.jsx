import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/client";
import { useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";

const TABS = ["Orders", "Wishlist", "Settings"];

export default function Profile() {
  const { isLoggedIn, login, logout, userName, userEmail, userId, wishlistIds, products, fetchProducts, orders, setOrders } = useStore();
  const [activeTab, setActiveTab] = useState("Orders");
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [wishProds, setWishProds] = useState([]);

  useEffect(() => {
    if (isLoggedIn) getOrders(userId).then((r) => setOrders(r.data || [])).catch(() => {});
  }, [isLoggedIn, userId, setOrders]);

  useEffect(() => { if (products.length === 0) fetchProducts(); }, []);
  useEffect(() => { setWishProds(products.filter((p) => wishlistIds.includes(p.id))); }, [wishlistIds, products]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-bg-card border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-3xl mx-auto mb-4">🛒</div>
            <h1 className="text-2xl font-black text-white">Welcome Back</h1>
            <p className="text-muted text-sm mt-1">Sign in to your ShopSmart AI account</p>
          </div>
          <div className="flex flex-col gap-4">
            {[["Display Name", loginName, setLoginName, "Ravi Kumar", "text"], ["Email", loginEmail, setLoginEmail, "ravi@example.com", "email"]].map(
              ([label, val, setter, ph, type]) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-xs text-muted font-medium">{label}</label>
                  <input value={val} onChange={(e) => setter(e.target.value)} placeholder={ph} type={type}
                    className="bg-bg-surface border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-primary" />
                </div>
              )
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted font-medium">Password (demo — any value)</label>
              <input type="password" placeholder="••••••••"
                className="bg-bg-surface border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={() => login(loginName || "Demo User", loginEmail)}
            className="w-full py-3.5 bg-grad-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity">
            Sign In
          </button>
          <p className="text-center text-muted text-xs">Demo: enter any name and click Sign In</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-5 mb-8 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-grad-primary flex items-center justify-center text-white text-3xl font-black">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{userName}</h1>
            <p className="text-muted text-sm">{userEmail}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full">Verified ✓</span>
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">AI Shopper</span>
            </div>
          </div>
          <button onClick={logout} className="px-5 py-2.5 border border-secondary/50 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-colors">Sign Out</button>
        </div>

        <div className="flex gap-1 border-b border-white/10 mb-6">
          {TABS.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-white"}`}>
              {t === "Orders" ? `📦 ${t}` : t === "Wishlist" ? `❤️ ${t}` : `⚙️ ${t}`}
            </button>
          ))}
        </div>

        {activeTab === "Orders" && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-muted mb-4">No orders yet</p>
                <Link to="/products" className="px-6 py-2.5 bg-grad-primary text-white rounded-xl font-semibold text-sm">Browse Products</Link>
              </div>
            ) : orders.map((o) => (
              <div key={o.order_id} className="flex items-center justify-between bg-bg-card border border-white/10 rounded-2xl p-5 flex-wrap gap-3">
                <div>
                  <p className="font-bold text-primary">{o.order_id}</p>
                  <p className="text-muted text-sm">{o.items?.length || 0} items</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${o.status === "Confirmed" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"}`}>{o.status}</span>
                <p className="text-primary font-bold">₹{o.grand_total?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Wishlist" && (
          wishProds.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">❤️</div>
              <p className="text-muted mb-4">Wishlist is empty</p>
              <Link to="/products" className="px-6 py-2.5 bg-grad-primary text-white rounded-xl font-semibold text-sm">Discover Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {wishProds.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        )}

        {activeTab === "Settings" && (
          <div className="max-w-md flex flex-col gap-5">
            <h2 className="text-lg font-bold">Account Settings</h2>
            {[["Display Name", userName], ["Email", userEmail]].map(([label, val]) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-xs text-muted font-medium">{label}</label>
                <input defaultValue={val} className="bg-bg-surface border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
            ))}
            <button className="self-start px-6 py-2.5 bg-grad-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
