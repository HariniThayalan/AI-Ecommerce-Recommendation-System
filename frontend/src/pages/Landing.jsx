import { useNavigate } from "react-router-dom";
import { ShoppingBag, Cpu, Zap, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { useStore } from "../store/useStore";

const FEATURES = [
  { icon: Cpu,         title: "AI-Powered",    desc: "Neural recommendations tailored to you" },
  { icon: Zap,         title: "Instant",        desc: "Real-time product discovery engine" },
  { icon: ShieldCheck, title: "Secure",         desc: "Enterprise-grade encrypted checkout" },
  { icon: Truck,       title: "Fast Delivery",  desc: "Express delivery to your doorstep" },
];

const AI_MODES = [
  { id: "top_rated",     emoji: "🔥", title: "Top Rated",    desc: "Bayesian weighted average from review counts and ratings. Surfaces genuinely popular products.", color: "from-orange-500 to-yellow-500" },
  { id: "content",       emoji: "🧠", title: "Content-Based",desc: "TF-IDF on product tags + cosine similarity. Products like what you're viewing.", color: "from-primary to-violet-500" },
  { id: "collaborative", emoji: "👥", title: "Collaborative", desc: "User-user similarity on rating history. What people with similar tastes loved.", color: "from-secondary to-pink-500" },
  { id: "hybrid",        emoji: "⚡", title: "Hybrid",        desc: "Weighted combination of all three. Best overall recommendation quality.", color: "from-accent to-teal-400" },
];

const CATEGORIES = ["Beauty", "Personal", "Health", "Household", "Food", "Sports", "Clothing", "Electronics"];

export default function Landing() {
  const navigate  = useNavigate();
  const { fetchRecommendations } = useStore();

  const handleMode = (mode) => {
    fetchRecommendations(mode);
    navigate("/products");
  };

  return (
    <div className="bg-bg-base text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="min-h-[92vh] flex items-center justify-center text-center px-4"
        style={{ background: "radial-gradient(ellipse at 50% 40%, #16213E 0%, #0F0E17 65%)" }}
      >
        <div className="max-w-3xl flex flex-col items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30
                          flex items-center justify-center text-4xl animate-pulse">
            🛒
          </div>
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight">
              Shop Smarter<br />
              <span className="grad-text">with AI</span>
            </h1>
            <p className="mt-5 text-muted text-lg max-w-lg mx-auto leading-relaxed">
              Personalized recommendations powered by Content-Based, Collaborative, and Hybrid AI engines.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 px-8 py-3.5 bg-grad-primary text-white
                         rounded-2xl text-base font-bold hover:opacity-90 transition-opacity
                         shadow-[0_0_30px_rgba(108,99,255,0.35)]"
            >
              <ShoppingBag size={20} /> Browse Products
            </button>
            <button
              onClick={() => handleMode("top_rated")}
              className="flex items-center gap-2 px-8 py-3.5 border border-primary/50
                         text-white rounded-2xl text-base font-semibold
                         hover:bg-primary/10 transition-colors"
            >
              View Top Picks <ArrowRight size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 sm:gap-16 mt-4">
            {[["1,600+", "Products"], ["1,600+", "Users"], ["4", "AI Modes"], ["4,000+", "Ratings"]].map(
              ([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black grad-text">{num}</div>
                  <div className="text-muted text-xs mt-1">{label}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why ShopSmart AI?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="bg-bg-card border border-white/10 rounded-2xl p-6 text-center
                         card-hover flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <Icon className="text-primary" size={28} />
              </div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Mode Cards ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">4 AI Recommendation Engines</h2>
          <p className="text-muted text-center mb-12 max-w-xl mx-auto">
            Each engine uses a different strategy. Switch between them in the Products page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {AI_MODES.map((m) => (
              <div key={m.id}
                className="bg-bg-card border border-white/10 rounded-2xl p-6
                           card-hover flex flex-col gap-3">
                <div className="text-4xl">{m.emoji}</div>
                <h3 className="text-xl font-bold">{m.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{m.desc}</p>
                <button
                  onClick={() => handleMode(m.id)}
                  className={`mt-2 self-start px-5 py-2 rounded-xl text-sm font-semibold
                             text-white bg-gradient-to-r ${m.color} hover:opacity-90 transition-opacity`}
                >
                  Try it →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Categories</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { useStore.getState().fetchProducts({ category: cat }); navigate("/products"); }}
              className="px-6 py-3 bg-bg-card border border-white/15 rounded-full text-sm
                         font-semibold text-muted hover:border-primary hover:text-primary
                         transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-bg-surface/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Browse Products", desc: "Explore 1,600+ products across categories" },
              { step: "2", title: "AI Learns",        desc: "Our engines analyse your interactions and similar users" },
              { step: "3", title: "Get Recommendations", desc: "Receive hyper-personalised product suggestions" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-grad-primary flex items-center
                                justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(108,99,255,0.4)]">
                  {step}
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
