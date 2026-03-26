import React from 'react';

export default function ChatbotButton({ onOpen, unreadCount = 0 }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end group">
      {/* Tooltip */}
      <div className="mb-2 px-3 py-1.5 bg-bg-card border border-primary/30 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
        Ask ShopSmart AI
      </div>

      <button
        onClick={onOpen}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF6584] 
                   flex items-center justify-center shadow-[0_8px_32px_rgba(108,99,255,0.5)]
                   hover:scale-110 transition-transform active:scale-95 group"
      >
        {/* Pulse Effect */}
        <div className="absolute inset-0 rounded-full bg-primary/40 chatbot-pulse" />
        
        {/* Robot SVG */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="relative z-10 transition-transform group-hover:rotate-12">
          {/* Head */}
          <rect x="4" y="6" width="16" height="14" rx="3" stroke="white" strokeWidth="1.5"/>
          {/* Eyes */}
          <circle cx="9" cy="12" r="1.5" fill="white">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="15" cy="12" r="1.5" fill="white">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Antenna */}
          <line x1="12" y1="2" x2="12" y2="6" stroke="white" strokeWidth="1.5"/>
          <circle cx="12" cy="2" r="1.5" fill="white"/>
          {/* Smile */}
          <path d="M9 17 Q12 19 15 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Circuit Detail */}
          <path d="M7 8 L9 8 L9 10" stroke="white" strokeWidth="0.8" opacity="0.5"/>
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-bg-base
                          flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
    </div>
  );
}
