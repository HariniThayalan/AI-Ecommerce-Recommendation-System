import { create } from "zustand";
import * as api from "../api/client";
import toast from "react-hot-toast";

const DEMO_USER = "1705"; // real User's ID in the CSV — has collaborative data

export const useStore = create((set, get) => ({
  // ── Auth ────────────────────────────────────────────────────────────────────
  userId:    DEMO_USER,
  userName:  "Demo User",
  userEmail: "demo@shopsmart.ai",
  isLoggedIn: false,
  searchHistory: [],
  orders: [],

  login: (name, email) => {
    set({ isLoggedIn: true, userName: name, userEmail: email || "user@shopsmart.ai" });
    toast.success(`Welcome, ${name}! 🎉`);
  },
  logout: () => {
    set({ isLoggedIn: false, userName: "Demo User", userEmail: "demo@shopsmart.ai" });
    toast("Signed out.");
  },

  // ── Products ─────────────────────────────────────────────────────────────────
  products:         [],
  totalCount:       0,
  isLoading:        false,
  recMode:          "top_rated",
  searchQuery:      "",
  selectedCategory: "All",
  minRating:        0,
  maxPrice:         10000,
  sortBy:           "relevance",
  currentProdId:    "8",  // default product for content/hybrid recs

  // ── Multi-mode Recommendations (auto-loaded) ──────────────────────────────────
  multiRecs: { content: [], collaborative: [], hybrid: [] },
  multiRecsLoading: false,

  fetchProducts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.getProducts({ limit: 48, offset: 0, ...params });
      set({ products: res.data.products, totalCount: res.data.total, recMode: "top_rated" });
    } catch (_) {
      /* error toast handled by interceptor */
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecommendations: async (mode, prodId) => {
    const pid = prodId || get().currentProdId;
    const uid = get().userId;
    set({ isLoading: true, recMode: mode });
    try {
      let res;
      if (mode === "top_rated")      res = await api.getTopRated(48);
      else if (mode === "content")   res = await api.getContentRecs(pid, 48);
      else if (mode === "collaborative") res = await api.getCollabRecs(uid, 48);
      else                           res = await api.getHybridRecs(uid, pid, 48);
      set({ products: res.data.recommendations || [] });
    } catch (_) {
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllRecommendations: async (prodId) => {
    const pid = prodId || get().currentProdId;
    const uid = get().userId;
    set({ multiRecsLoading: true });
    try {
      const [contentRes, collabRes, hybridRes] = await Promise.all([
        api.getContentRecs(pid, 12),
        api.getCollabRecs(uid, 12),
        api.getHybridRecs(uid, pid, 12),
      ]);
      set({
        multiRecs: {
          content:       contentRes.data.recommendations || [],
          collaborative: collabRes.data.recommendations  || [],
          hybrid:        hybridRes.data.recommendations  || [],
        },
      });
    } catch (_) {
    } finally {
      set({ multiRecsLoading: false });
    }
  },

  setSearchQuery:      (q)    => set({ searchQuery: q }),
  setSelectedCategory: (cat)  => set({ selectedCategory: cat }),
  setMinRating:        (r)    => set({ minRating: r }),
  setMaxPrice:         (p)    => set({ maxPrice: p }),
  setSortBy:           (s)    => set({ sortBy: s }),

  addToSearchHistory: (query) => set(state => ({
    searchHistory: [
      ...state.searchHistory.filter(q => q !== query), // avoid dupes
      query
    ].slice(-20)  // keep last 20 searches
  })),

  setOrders: (orders) => set({ orders }),

  // ── Cart ─────────────────────────────────────────────────────────────────────
  cartItems: [],

  addToCart: async (product) => {
    const uid = get().userId;
    try {
      const res = await api.addToCart(uid, product, 1);
      set({ cartItems: res.data.cart });
      toast.success(`Added to cart!`);
    } catch (_) {}
  },

  removeFromCart: async (productId) => {
    const uid = get().userId;
    try {
      const res = await api.removeFromCart(uid, productId);
      set({ cartItems: res.data.cart });
      toast("Item removed.");
    } catch (_) {}
  },

  updateQty: async (productId, qty) => {
    const uid = get().userId;
    try {
      const res = await api.updateQty(uid, productId, qty);
      set({ cartItems: res.data.cart });
    } catch (_) {}
  },

  get cartCount()    { return get().cartItems.reduce((s, i) => s + i.quantity, 0); },
  get cartSubtotal() {
    return get().cartItems.reduce(
      (s, i) => s + i.product.final_price * i.quantity, 0
    );
  },

  // ── Wishlist ─────────────────────────────────────────────────────────────────
  wishlistIds: [],

  toggleWishlist: async (product) => {
    const uid = get().userId;
    try {
      const res = await api.toggleWishlist(uid, product.id);
      const cur = get().wishlistIds;
      if (res.data.status === "added") {
        set({ wishlistIds: [...cur, product.id] });
        toast.success("Added to wishlist! ❤️");
      } else {
        set({ wishlistIds: cur.filter((id) => id !== product.id) });
        toast("Removed from wishlist.");
      }
    } catch (_) {}
  },

  // ── Orders ───────────────────────────────────────────────────────────────────
  currentOrderId: "",

  placeOrder: async (orderData) => {
    try {
      const res = await api.placeOrder(orderData);
      set({ currentOrderId: res.data.order_id, cartItems: [] });
      toast.success(`Order ${res.data.order_id} placed! 🎉`);
      return res.data.order_id;
    } catch (_) {
      return null;
    }
  },
}));
