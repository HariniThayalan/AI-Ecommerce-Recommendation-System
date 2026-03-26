import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MessageBubble({ message, onRetry }) {
  const navigate = useNavigate();
  const isUser = message.role === "user";
  const { isTyping, isError, products, content, timestamp } = message;

  if (isTyping) {
    return (
      <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2 shadow-lg">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="6" width="16" height="14" rx="3" stroke="white" strokeWidth="1.5"/>
              <circle cx="9" cy="12" r="1.5" fill="white"/>
              <circle cx="15" cy="12" r="1.5" fill="white"/>
              <path d="M9 17 Q12 19 15 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
           </svg>
        </div>
        <div className="bg-white/5 border border-primary/20 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-left-2">
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-2xl rounded-tl-none">
          <p className="text-red-400 text-xs mb-2">{content}</p>
          <button 
            onClick={onRetry}
            className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:underline"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%]`}>
        {!isUser && (
          <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2 shadow-lg">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="6" width="16" height="14" rx="3" stroke="white" strokeWidth="1.5"/>
                <circle cx="9" cy="12" r="1.5" fill="white"/>
                <circle cx="15" cy="12" r="1.5" fill="white"/>
                <path d="M9 17 Q12 19 15 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
             </svg>
          </div>
        )}
        
        <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none' 
            : 'bg-white/5 border border-primary/15 text-[#c8c6e0] rounded-tl-none'
          }`}
        >
          {content}
        </div>
      </div>

      <span className="text-[10px] text-muted mt-1 px-1">
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>

      {/* Product Cards */}
      {products && products.length > 0 && (
        <div className="mt-3 ml-10 w-full max-w-[320px]">
          <div className="flex gap-2.5 overflow-x-auto pb-2 products-scroll">
            {products.map((p) => (
              <div 
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="shrink-0 w-[140px] bg-[#1a1828] border border-primary/15 rounded-xl p-2 cursor-pointer
                           hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <img 
                  src={p.image_url || `https://picsum.photos/seed/${p.id}/140/90`}
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/140/90`; }}
                  alt={p.name}
                  className="w-full h-[90px] object-cover rounded-lg mb-2"
                />
                <h4 className="text-[11px] font-medium text-white line-clamp-2 min-h-[32px] mb-1">
                  {p.name}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary">₹{p.final_price}</span>
                  <span className="text-[10px] text-yellow-500 flex items-center gap-0.5">
                    ★ {p.avg_rating}
                  </span>
                </div>
                <button className="w-full py-1.5 bg-primary/10 border border-primary/30 rounded-lg 
                                   text-primary text-[10px] font-bold uppercase tracking-wider
                                   hover:bg-primary hover:text-white transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
