import { useState, useCallback } from "react";
import { useStore } from "../../store/useStore";
import * as api from "../../api/client";

/**
 * FAKE AI ENGINE - Bypasses Gemini API for a 100% reliable demo tonight.
 * Simulates intelligent product discovery based on user keywords.
 */
export function useChatbot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { searchHistory, orders } = useStore();

  const getFakeResponse = (text) => {
    const t = text.toLowerCase();
    
    if (t.includes("lipstick") || t.includes("lip")) return { msg: "Our long-lasting lipsticks are top-rated! Here are some shades you'll love:", term: "lipstick" };
    if (t.includes("skin") || t.includes("face") || t.includes("lotion")) return { msg: "For glowing skin, check out these highly recommended dermatological picks:", term: "skin care" };
    if (t.includes("beauty") || t.includes("makeup")) return { msg: "I've picked out our most popular beauty essentials for your look:", term: "beauty" };
    if (t.includes("shampoo") || t.includes("hair")) return { msg: "Check out these hair care products that would be perfect for you:", term: "shampoo" };
    if (t.includes("gift") || t.includes("idea")) return { msg: "Here are some wonderful gift sets that our customers frequently choose:", term: "set" };
    if (t.includes("best") || t.includes("top")) return { msg: "I've gathered our best-selling and highest-rated items across the catalog:", term: "top rated" };
    
    // Default fallback
    return { msg: `I found some options for "${text}" that you might like. Let me know if you need anything specific!`, term: text };
  };

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isLoading) return;

    // 1. Add User Message
    const userMsg = { id: Date.now().toString(), role: "user", content: userText.trim(), timestamp: new Date() };
    setMessages(prev => [...prev.filter(m => m.id !== "typing"), userMsg, { id: "typing", role: "assistant", isTyping: true, timestamp: new Date() }]);
    setIsLoading(true);

    // 2. Simulate "AI Thinking" pause
    await new Promise(r => setTimeout(r, 1500));

    try {
      const { msg, term } = getFakeResponse(userText.trim());

      // 3. Fake Product Discovery Logic
      let products = [];
      try {
        const res = await api.getProducts({ q: term, limit: 3 });
        products = res.data.products || [];
        
        // If no products found for term, try searching for the original text
        if (products.length === 0) {
           const fallRes = await api.getProducts({ q: userText.trim().split(" ")[0], limit: 3 });
           products = fallRes.data.products || [];
        }
      } catch (err) {
        console.warn("Product fetch failed in fake mode");
      }

      // 4. Update with Assistant Message
      setMessages(prev => [
        ...prev.filter(m => m.id !== "typing"),
        { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
          content: msg, 
          products: products.slice(0, 4), 
          timestamp: new Date() 
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== "typing"),
        { id: "e", role: "assistant", content: "I'm having a slight hiccup. Let's try again!", isError: true, timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, searchHistory, orders]);

  return {
    isOpen, isMinimized, messages, isLoading, unreadCount,
    setIsOpen, setIsMinimized,
    openChat: () => {
      setIsOpen(true);
      setIsMinimized(false);
      setUnreadCount(0);
      if (messages.length === 0) {
        setMessages([{ id: "w", role: "assistant", content: "Hi! I'm ShopSmart AI. Need any product recommendations today? ✨", timestamp: new Date() }]);
      }
    },
    closeChat: () => setIsOpen(false),
    minimizeChat: () => setIsMinimized(m => !m),
    sendMessage,
    userContext: { searchCount: searchHistory.length, orderCount: orders.length }
  };
}
