import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({ baseURL: "http://localhost:8000" });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.detail || "Server error — is FastAPI running on :8000?";
    toast.error(msg);
    return Promise.reject(err);
  }
);

// ── Products ───────────────────────────────────────────────────────────────────
export const getProducts  = (params) => api.get("/products", { params });
export const getProduct   = (id)     => api.get(`/products/${id}`);

// ── Recommendations ────────────────────────────────────────────────────────────
export const getTopRated    = (n = 24)           => api.get("/recommend/top-rated",             { params: { n } });
export const getContentRecs = (prodId, n = 12)   => api.get(`/recommend/content/${prodId}`,      { params: { n } });
export const getCollabRecs  = (userId, n = 12)   => api.get(`/recommend/collaborative/${userId}`, { params: { n } });
export const getHybridRecs  = (uid, pid, n = 12) => api.get(`/recommend/hybrid/${uid}/${pid}`,   { params: { n } });

// ── Cart ───────────────────────────────────────────────────────────────────────
export const getCart        = (uid)          => api.get(`/cart/${uid}`);
export const addToCart      = (uid, p, qty)  => api.post(`/cart/${uid}/add`, { product: p, quantity: qty });
export const updateQty      = (uid, pid, q)  => api.put(`/cart/${uid}/quantity`, null, { params: { product_id: pid, quantity: q } });
export const removeFromCart = (uid, pid)     => api.delete(`/cart/${uid}/remove/${pid}`);

// ── Orders ─────────────────────────────────────────────────────────────────────
export const placeOrder = (order) => api.post("/orders", order);
export const getOrders  = (uid)   => api.get(`/orders/${uid}`);

// ── Wishlist ───────────────────────────────────────────────────────────────────
export const toggleWishlist = (uid, pid) =>
  api.post(`/wishlist/${uid}/toggle`, null, { params: { product_id: pid } });
export const getWishlist = (uid) => api.get(`/wishlist/${uid}`);
