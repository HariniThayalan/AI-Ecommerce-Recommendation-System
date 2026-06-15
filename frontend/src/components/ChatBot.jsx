import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

function ChatBot() {
  const { user } = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load chat history when user changes
  useEffect(() => {
    const defaultMsg = [
      { sender: 'bot', text: '✨ Hi! Welcome to AuraMart. I am Aura AI, your personalized shopping assistant. 🛍️\n\nAsk me about our cosmetics 💅, skincare creams 🧴, or hair care products 💇!' }
    ]
    const key = user ? `chat_history_${user.uid}` : 'chat_history_guest'
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (e) {
        setMessages(defaultMsg)
      }
    } else {
      setMessages(defaultMsg)
    }
  }, [user])

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length === 0) return
    const key = user ? `chat_history_${user.uid}` : 'chat_history_guest'
    localStorage.setItem(key, JSON.stringify(messages))
  }, [messages, user])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = { sender: 'user', text: message }
    setMessages(prev => [...prev, userMessage])
    const currentMessage = message
    setMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/chat',
        { message: currentMessage }
      )
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the assistant. 🔌' }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      { sender: 'bot', text: '✨ Chat cleared! How else can I assist your shopping journey today? 🛍️' }
    ])
  }

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {/* Floating Chat Bubble Button */}
      <button 
        id="chatbot-toggle-btn"
        className="chatbot-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✨ Aura AI</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="online-badge">Online</span>
              <button 
                onClick={clearChat}
                title="Clear chat"
                className="chatbot-clear-btn"
                type="button"
              >
                🧹
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.sender}`}>
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble bot typing">
                <p style={{ margin: 0 }}>💭 Aura AI is thinking...</p>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="chatbot-input-area">
            <input
              id="chatbot-input"
              value={message}
              placeholder="💬 Ask Aura AI about products..."
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" id="chatbot-send-btn">🚀 Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ChatBot