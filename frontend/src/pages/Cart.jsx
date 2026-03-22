import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, Tag } from "lucide-react";
import { useState } from "react";
import { useStore } from "../store/useStore";

const COUPONS = { SAVE10: 0.10, FIRST50: 50 };

export default function Cart() {
  const { cartItems, removeFromCart, updateQty } = useStore();
  const [coupon,   setCoupon]   = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const subtotal   = cartItems.reduce((s, i) => s + i.product.final_price * i.quantity, 0);
  const discountAmt = typeof discount === "number" && discount < 1
    ? subtotal * discount
    : (typeof discount === "number" ? discount : 0);
  const gst       = (subtotal - discountAmt) * 0.18;
  const grandTotal = subtotal - discountAmt + gst;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "SAVE10")  { setDiscount(0.10); setCouponMsg("10% discount applied! 🎉"); }
    else if (code === "FIRST50") { setDiscount(50); setCouponMsg("₹50 flat discount applied! 🎉"); }
    else { setDiscount(0); setCouponMsg("Invalid coupon code."); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart size={80} className="text-muted mb-6 opacity-30" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-muted mb-8">Discover products with AI-powered recommendations</p>
        <Link to="/products"
          className="px-8 py-3 bg-grad-primary text-white rounded-2xl font-bold hover:opacity-90">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">
          Your Cart <span className="text-muted text-xl font-normal">({cartItems.length} items)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Items list */}
          <div className="flex-1 flex flex-col gap-3">
            {cartItems.map(({ product: p, quantity }) => (
              <div key={p.id}
                className="flex items-center gap-4 bg-bg-card border border-white/10
                           rounded-2xl p-4 flex-wrap">

                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-18 h-18 rounded-xl object-cover shrink-0 w-16 h-16"
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/150/150`; }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm line-clamp-1">{p.name}</p>
                  <p className="text-muted text-xs mt-0.5">{p.brand} · {p.category}</p>
                  <p className="text-primary font-bold mt-1">{p.final_price_display}</p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center border border-white/15 rounded-xl overflow-hidden shrink-0">
                  <button onClick={() => updateQty(p.id, quantity - 1)}
                    className="px-3 py-2 hover:bg-white/5 text-muted hover:text-white">
                    <Minus size={14} />
                  </button>
                  <span className="px-3 py-2 text-sm font-bold min-w-[2rem] text-center">{quantity}</span>
                  <button onClick={() => updateQty(p.id, quantity + 1)}
                    className="px-3 py-2 hover:bg-white/5 text-muted hover:text-white">
                    <Plus size={14} />
                  </button>
                </div>

                {/* Line total */}
                <span className="text-white font-bold shrink-0">
                  ₹{(p.final_price * quantity).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>

                <button onClick={() => removeFromCart(p.id)}
                  className="p-2 text-muted hover:text-secondary transition-colors rounded-lg hover:bg-secondary/10">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 shrink-0 bg-bg-card border border-white/10
                          rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
            <hr className="border-white/10" />

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span>
                  <span>−₹{discountAmt.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Delivery</span><span className="text-accent font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>GST (18%)</span>
                <span>₹{gst.toFixed(0)}</span>
              </div>
            </div>

            <hr className="border-white/10" />
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Grand Total</span>
              <span className="text-primary">₹{grandTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
            </div>

            {/* Coupon */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 text-xs text-muted">
                <Tag size={12} /> Try SAVE10 or FIRST50
              </div>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 bg-bg-surface border border-white/15 rounded-xl px-3 py-2
                             text-sm text-white placeholder-muted focus:outline-none focus:border-primary"
                />
                <button onClick={applyCoupon}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold
                             hover:opacity-90 transition-opacity">
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs ${couponMsg.includes("Invalid") ? "text-secondary" : "text-accent"}`}>
                  {couponMsg}
                </p>
              )}
            </div>

            <Link
              to="/checkout"
              className="w-full py-3.5 bg-grad-primary text-white text-center rounded-2xl
                         font-bold text-sm hover:opacity-90 transition-opacity mt-2 block"
            >
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
