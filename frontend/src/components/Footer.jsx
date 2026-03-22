import { Link } from "react-router-dom";
import { ShoppingBag, Github, Mail, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary" size={20} />
              <span className="font-black text-lg">Shop<span className="grad-text">Smart AI</span></span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              AI-powered shopping for everyone. Your preferences, our intelligence.
            </p>
            <div className="flex gap-3 mt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                 className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-muted transition-colors">
                <Github size={16} />
              </a>
              <a href="mailto:contact@shopsmart.ai"
                 className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-muted transition-colors">
                <Mail size={16} />
              </a>
              <a href="#"
                 className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-muted transition-colors">
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-muted text-sm">
              {[["Home", "/"], ["Products", "/products"], ["Cart", "/cart"], ["Profile", "/profile"]].map(
                ([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="hover:text-primary transition-colors">{label}</Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* AI Modes */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">AI Modes</h3>
            <ul className="flex flex-col gap-2 text-muted text-sm">
              {["Top Rated", "Content-Based", "Collaborative", "Hybrid"].map((m) => (
                <li key={m}>
                  <Link to="/products" className="hover:text-primary transition-colors">{m}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-muted text-sm mb-3">Get the latest AI-driven deals.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-bg-base border border-white/20 rounded-lg px-3 py-2
                           text-sm text-white placeholder-muted focus:outline-none
                           focus:border-primary transition-colors"
              />
              <button className="px-3 py-2 bg-grad-primary rounded-lg text-sm text-white font-semibold
                                 hover:opacity-90 transition-opacity whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 text-center text-muted text-xs">
        © 2026 ShopSmart AI · Built with React, FastAPI & scikit-learn · Powered by ML
      </div>
    </footer>
  );
}
