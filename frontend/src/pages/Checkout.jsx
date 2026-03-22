import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import StepIndicator from "../components/StepIndicator";

const PAYMENT_TABS = ["Card", "UPI", "Net Banking", "Cash on Delivery"];
const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra"];

function Field({ label, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="bg-bg-surface border border-white/15 rounded-xl px-4 py-3 text-sm text-white
                   placeholder-muted focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

function AddressStep({ onNext }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold">Delivery Address</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *"      placeholder="Ravi Kumar" />
        <Field label="Phone *"          placeholder="+91 9876543210" />
        <Field label="Address Line 1 *" placeholder="123 Main Street" />
        <Field label="Address Line 2"   placeholder="Apt 4B (optional)" />
        <Field label="City"             placeholder="Chennai" />
        <Field label="State"            placeholder="Tamil Nadu" />
        <Field label="Pincode"          placeholder="600001" />
        <Field label="Landmark"         placeholder="Near bus stop (optional)" />
      </div>
      <button
        onClick={onNext}
        className="w-full py-3.5 bg-grad-primary text-white rounded-2xl font-bold
                   hover:opacity-90 transition-opacity mt-2"
      >
        Continue to Payment →
      </button>
    </div>
  );
}

function PaymentStep({ cartItems, grandTotal, onPlaceOrder, isProcessing }) {
  const [activeTab, setActiveTab] = useState("Card");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Payment Method</h2>

      {/* Tab selector */}
      <div className="flex gap-1 bg-bg-surface rounded-xl p-1">
        {PAYMENT_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors
              ${activeTab === t ? "bg-primary text-white" : "text-muted hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-col gap-3">
        {activeTab === "Card" && (
          <>
            <Field label="Card Number" placeholder="4242 4242 4242 4242" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" placeholder="MM / YY" />
              <Field label="CVV"    placeholder="•••" type="password" />
            </div>
            <Field label="Name on Card" placeholder="RAVI KUMAR" />
          </>
        )}
        {activeTab === "UPI" && (
          <Field label="UPI ID" placeholder="yourname@ybl" />
        )}
        {activeTab === "Net Banking" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted font-medium">Select Bank</label>
            <select className="bg-bg-surface border border-white/15 rounded-xl px-4 py-3
                               text-sm text-white focus:outline-none focus:border-primary">
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}
        {activeTab === "Cash on Delivery" && (
          <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <span className="text-2xl">💵</span>
            <p className="text-sm text-muted">Pay in cash when your order is delivered.</p>
          </div>
        )}
      </div>

      {/* Mini order summary */}
      <div className="bg-bg-surface rounded-2xl p-4 border border-white/10">
        <div className="flex justify-between text-sm text-muted mb-2">
          <span>{cartItems.length} item(s)</span>
          <span>Grand Total</span>
        </div>
        <div className="flex justify-between text-white font-bold text-xl">
          <span>Order Total</span>
          <span className="text-primary">
            ₹{grandTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </span>
        </div>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={isProcessing}
        className="w-full py-4 bg-grad-primary text-white rounded-2xl font-bold text-base
                   hover:opacity-90 transition-opacity flex items-center justify-center gap-3
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock size={18} />
            Pay ₹{grandTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Securely
          </>
        )}
      </button>
    </div>
  );
}

function ConfirmationStep({ orderId }) {
  const navigate  = useNavigate();
  const eta = new Date();
  eta.setDate(eta.getDate() + 5);
  const etaStr = eta.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col items-center text-center gap-5 py-8">
      <div className="w-24 h-24 rounded-full bg-accent/20 border-4 border-accent
                      flex items-center justify-center animate-bounce">
        <CheckCircle className="text-accent" size={48} />
      </div>
      <div>
        <h2 className="text-3xl font-black text-white mb-2">Order Confirmed! 🎉</h2>
        <p className="text-muted">Thank you for shopping with ShopSmart AI</p>
      </div>
      <div className="flex flex-col gap-2 bg-bg-surface rounded-2xl p-6 w-full max-w-sm text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Order ID</span>
          <span className="text-primary font-bold">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Estimated Delivery</span>
          <span className="text-white font-semibold">{etaStr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Status</span>
          <span className="text-accent font-semibold">Confirmed ✓</span>
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <button onClick={() => navigate("/profile")}
          className="px-6 py-2.5 border border-primary text-primary rounded-xl font-semibold
                     hover:bg-primary/10 transition-colors text-sm">
          View Orders
        </button>
        <button onClick={() => navigate("/products")}
          className="px-6 py-2.5 bg-grad-primary text-white rounded-xl font-semibold
                     hover:opacity-90 transition-opacity text-sm">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { cartItems, placeOrder, userId } = useStore();
  const [step,        setStep]        = useState(1);
  const [isProcessing, setProcessing] = useState(false);
  const [orderId,      setOrderId]    = useState("");

  const subtotal   = cartItems.reduce((s, i) => s + i.product.final_price * i.quantity, 0);
  const gst        = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  const handlePlaceOrder = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));  // simulate payment delay
    const oid = await placeOrder({
      user_id: userId,
      items: cartItems,
      subtotal,
      discount: 0,
      gst,
      grand_total: grandTotal,
      payment_method: "card",
      address: { city: "Chennai" },
    });
    setOrderId(oid || "ORD-DEMO001");
    setStep(3);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white text-center mb-2">Checkout</h1>
        <StepIndicator currentStep={step} />

        <div className="bg-bg-card border border-white/10 rounded-3xl p-6 sm:p-8">
          {step === 1 && <AddressStep onNext={() => setStep(2)} />}
          {step === 2 && (
            <PaymentStep
              cartItems={cartItems}
              grandTotal={grandTotal}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
            />
          )}
          {step === 3 && <ConfirmationStep orderId={orderId} />}
        </div>
      </div>
    </div>
  );
}
