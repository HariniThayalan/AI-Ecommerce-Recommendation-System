import React from 'react';
import { useChatbot } from "./useChatbot";
import ChatbotButton from "./ChatbotButton";
import ChatPanel from "./ChatPanel";

export default function Chatbot() {
  const {
    isOpen, isMinimized, messages, isLoading, unreadCount,
    openChat, closeChat, minimizeChat, sendMessage, userContext
  } = useChatbot();

  return (
    <>
      {/* Always show the floating button if not open */}
      {!isOpen && (
        <ChatbotButton onOpen={openChat} unreadCount={unreadCount} />
      )}

      {/* Show panel when open and not minimized */}
      {isOpen && !isMinimized && (
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          onClose={closeChat}
          onMinimize={minimizeChat}
          isLoading={isLoading}
          userContext={userContext}
        />
      )}

      {/* Minimized tab — shown when minimized */}
      {isOpen && isMinimized && (
        <div
          className="fixed bottom-6 right-6 z-[9998] cursor-pointer
                     bg-gradient-to-r from-primary to-secondary
                     text-white text-xs font-semibold
                     px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(108,99,255,0.4)]
                     flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all
                     border border-white/10"
          onClick={minimizeChat}
        >
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="6" width="16" height="14" rx="3" stroke="white" strokeWidth="2"/>
                <circle cx="9" cy="12" r="2" fill="white"/>
                <circle cx="15" cy="12" r="2" fill="white"/>
             </svg>
          </div>
          <span className="tracking-wide text-[11px] uppercase font-bold">ShopSmart AI</span>
          {unreadCount > 0 && (
            <span className="bg-white text-primary text-[10px] rounded-full
                             w-4 h-4 flex items-center justify-center font-bold shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      )}
    </>
  );
}
