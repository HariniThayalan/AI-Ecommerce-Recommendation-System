import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Send, Target, Sparkles, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

const QUICK_PROMPTS = [
  "🔥 Top rated products", 
  "💄 Best beauty picks",
  "🧴 Skin care recommendations", 
  "⭐ Highly reviewed",
  "💰 Best value products", 
  "🎁 Gift ideas"
];

export default function ChatPanel({ 
  messages, onSend, onClose, onMinimize, 
  isLoading, userContext 
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9998] w-[380px] h-[560px] 
                    mobile:w-[calc(100vw-24px)] mobile:h-[70vh]
                    bg-[#13121f] border border-primary/25 rounded-[24px] 
                    flex flex-col shadow-2xl chat-panel-enter overflow-hidden group">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/15">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="6" width="16" height="14" rx="3" stroke="white" strokeWidth="1.5"/>
                <circle cx="9" cy="12" r="2" fill="white"/>
                <circle cx="15" cy="12" r="2" fill="white"/>
                <line x1="12" y1="2" x2="12" y2="6" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="2" r="1.5" fill="white"/>
                <path d="M9 17 Q12 19 15 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
             </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">ShopSmart AI</h3>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors"
          >
            <Minus size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* CONTEXT BAR */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[11px] text-muted whitespace-nowrap">🎯 Recommending based on:</span>
        <div className="flex gap-1.5 overflow-x-auto products-scroll no-scrollbar">
          {userContext.orderCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] whitespace-nowrap">
              📦 {userContext.orderCount} orders
            </span>
          )}
          {userContext.searchCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/25 text-secondary text-[10px] whitespace-nowrap">
              🔍 {userContext.searchCount} searches
            </span>
          )}
          {!userContext.orderCount && !userContext.searchCount && (
            <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[10px] whitespace-nowrap">
              ✨ New Visitor
            </span>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth no-scrollbar"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onRetry={() => onSend(messages[messages.length-2]?.content)} />
        ))}
      </div>

      {/* QUICK PROMPTS */}
      {messages.length < 3 && !isLoading && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto products-scroll no-scrollbar">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              className="px-3 py-1.5 bg-primary/5 hover:bg-primary/20 border border-primary/20 
                         rounded-full text-xs text-[#c8c6e0] whitespace-nowrap transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* INPUT ROW */}
      <div className="p-4 bg-[#1a1828]/50 border-t border-white/5">
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-2.5 bg-[#1a1828] border border-primary/20 rounded-2xl px-3 py-2
                     focus-within:border-primary/60 transition-colors shadow-inner"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about products..."
            className="flex-1 bg-transparent border-none text-[13.5px] text-white placeholder-[#6b6889] 
                       focus:ring-0 resize-none max-h-24 py-1"
            rows="1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary
                       flex items-center justify-center text-white shadow-lg disabled:opacity-50 
                       disabled:grayscale transition-all active:scale-90"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="rotate-45 -translate-y-0.5">
                <path d="M5 12L19 12M19 12L13 18M19 12L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
