import React, { useState, useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, clearCart, removeFromCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  // Helper to load initial address from localStorage
  const getInitialAddress = () => {
    const saved = localStorage.getItem('saved_address')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    }
  }

  // Helper to load initial step from localStorage
  const getInitialStep = () => {
    const saved = localStorage.getItem('saved_address')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.name && parsed.phone && parsed.line1) {
          return 2 // Proceed directly to payment if we already have a saved address
        }
      } catch (e) {
        // Fallback
      }
    }
    return 1 // Default to Address step
  }

  // Step state: 1 = Address, 2 = Payment, 3 = Confirm
  const [step, setStep] = useState(getInitialStep)

  // Address Details State
  const [address, setAddress] = useState(getInitialAddress)

  // Payment Method and Details State
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [upiId, setUpiId] = useState('')
  const [bank, setBank] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [orderId, setOrderId] = useState('')

  const buyNowProduct = location.state?.buyNowProduct
  const itemsToBuy = buyNowProduct ? [buyNowProduct] : cart
  const totalPrice = itemsToBuy.reduce((sum, item) => sum + item.price, 0)

  // Address fields configuration
  const fieldPairs = [
    { label: "👤 Full Name *", name: "name", placeholder: "", fullWidth: false },
    { label: "📞 Phone Number *", name: "phone", placeholder: "", fullWidth: false },
    { label: "🏠 Address Line 1 *", name: "line1", placeholder: "", fullWidth: true },
    { label: "🏢 Address Line 2", name: "line2", placeholder: "", fullWidth: true },
    { label: "🏙️ City", name: "city", placeholder: "", fullWidth: false },
    { label: "🗺️ State", name: "state", placeholder: "", fullWidth: false },
    { label: "📮 Pincode", name: "pincode", placeholder: "", fullWidth: false },
  ]

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const handleContinueToPayment = (e) => {
    e.preventDefault()
    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim()) {
      alert("Please fill in all required address fields (*)")
      return
    }
    localStorage.setItem('saved_address', JSON.stringify(address))
    setStep(2)
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  const handlePaySecurely = async (e) => {
    e.preventDefault()

    // Validate payment inputs based on selected tab
    if (paymentMethod === 'card') {
      if (!card.number.trim() || !card.expiry.trim() || !card.cvv.trim() || !card.name.trim()) {
        alert("Please fill in all card details")
        return
      }
      if (card.number.trim().replace(/\s/g, '').length < 16) {
        alert("Please enter a valid 16-digit card number")
        return
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        alert("Please enter a valid UPI ID (e.g. name@ybl)")
        return
      }
    } else if (paymentMethod === 'netbanking') {
      if (!bank) {
        alert("Please select a bank")
        return
      }
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post(
        'https://ai-ecommerce-recommendation-system.onrender.com/payment'
      )

      if (response.data.status === 'success') {
        const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
        setOrderId(generatedOrderId)

        // Save complete order details
        const order = {
          id: generatedOrderId,
          date: new Date().toISOString(),
          total: totalPrice,
          items: itemsToBuy,
          address: address,
          paymentMethod: paymentMethod
        }

        const existingOrders =
          JSON.parse(localStorage.getItem("orders")) || []

        existingOrders.push(order)

        localStorage.setItem(
          "orders",
          JSON.stringify(existingOrders)
        )

        // Record purchase history
        const purchaseHistoryKey =
          user
            ? `purchase_history_${user.uid}`
            : 'purchase_history_guest'

        const existingHistory =
          JSON.parse(localStorage.getItem(purchaseHistoryKey) || '[]')

        const itemIds = itemsToBuy.map(item => item.id)

        const updatedHistory = Array.from(
          new Set([...existingHistory, ...itemIds])
        )

        localStorage.setItem(
          purchaseHistoryKey,
          JSON.stringify(updatedHistory)
        )

        if (buyNowProduct) {
          removeFromCart(buyNowProduct.id)
        } else {
          clearCart()
        }

        setStep(3)
      }
    } catch (err) {
      alert('Payment initialization failed. Please make sure backend is active.')
    } finally {
      setIsLoading(false)
    }
  }

  // Render Step 1: Address Details
  const renderAddressStep = () => (
    <form onSubmit={handleContinueToPayment}>
      <h2 className="checkout-title">Delivery Address</h2>
      <div className="checkout-grid">
        {fieldPairs.map((field) => (
          <div
            key={field.name}
            className={`checkout-field ${field.fullWidth ? 'full-width' : ''}`}
          >
            <label htmlFor={field.name}>{field.label}</label>
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={address[field.name]}
              onChange={handleAddressChange}
              placeholder={field.placeholder}
              className="checkout-input"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          fontSize: '1rem',
          boxShadow: '0 4px 12px var(--color-primary-glow)'
        }}
      >
        Continue to Payment ➡️
      </button>
    </form>
  )

  // Render Step 2: Payment Details (Dummy Razorpay Mock)
  const renderPaymentStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="checkout-title">💳 Payment Method</h2>

      {/* Delivery Address Summary with Edit Option */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px', 
          background: 'rgba(255, 255, 255, 0.02)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '16px',
          borderRadius: '12px'
        }}
      >
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Deliver To</h4>
          <p style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px', color: 'var(--text-primary)' }}>
            {address.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.85rem' }}>| {address.phone}</span>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--color-primary)',
            border: '1px solid var(--border-glass-active)',
            padding: '6px 14px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            cursor: 'pointer',
            height: 'fit-content'
          }}
        >
          ✏️ Edit
        </button>
      </div>
      
      {/* Tab bar */}
      <div className="payment-tabs">
        <button
          type="button"
          onClick={() => handlePaymentMethodChange('card')}
          className={`payment-tab-trigger ${paymentMethod === 'card' ? 'active' : ''}`}
        >
          💳 Card
        </button>
        <button
          type="button"
          onClick={() => handlePaymentMethodChange('upi')}
          className={`payment-tab-trigger ${paymentMethod === 'upi' ? 'active' : ''}`}
        >
          📱 UPI
        </button>
        <button
          type="button"
          onClick={() => handlePaymentMethodChange('netbanking')}
          className={`payment-tab-trigger ${paymentMethod === 'netbanking' ? 'active' : ''}`}
        >
          🏦 Net Banking
        </button>
        <button
          type="button"
          onClick={() => handlePaymentMethodChange('cod')}
          className={`payment-tab-trigger ${paymentMethod === 'cod' ? 'active' : ''}`}
        >
          💵 Cash on Delivery
        </button>
      </div>

      {/* Tab Contents */}
      {paymentMethod === 'card' && (
        <div className="payment-tab-content">
          <input
            type="text"
            placeholder="Card Number (16 digits)"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            maxLength="19"
            className="checkout-input"
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="MM / YY"
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: e.target.value })}
              maxLength="5"
              style={{ flex: 1 }}
              className="checkout-input"
            />
            <input
              type="password"
              placeholder="CVV"
              value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value })}
              maxLength="4"
              style={{ flex: 1 }}
              className="checkout-input"
            />
          </div>
          <input
            type="text"
            placeholder="Name on Card"
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
            className="checkout-input"
          />
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="payment-tab-content">
          <input
            type="text"
            placeholder="Enter UPI ID (e.g. name@ybl)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="checkout-input"
          />
        </div>
      )}

      {paymentMethod === 'netbanking' && (
        <div className="payment-tab-content">
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="checkout-select"
          >
            <option value="">Select your bank...</option>
            <option value="sbi">State Bank of India</option>
            <option value="hdfc">HDFC Bank</option>
            <option value="icici">ICICI Bank</option>
            <option value="axis">Axis Bank</option>
            <option value="kotak">Kotak Mahindra</option>
          </select>
        </div>
      )}

      {paymentMethod === 'cod' && (
        <div className="payment-tab-content">
          <div className="info-banner">
            <span className="info-banner-icon">ℹ️</span>
            <span>Cash will be collected at the time of delivery.</span>
          </div>
        </div>
      )}

      {/* Order Total Box */}
      <div className="order-total-box">
        <span className="order-total-label">🏷️ Grand Total:</span>
        <span className="order-total-value">₹ {totalPrice}</span>
      </div>

      {/* Pay Securely Button */}
      <button
        onClick={handlePaySecurely}
        disabled={isLoading}
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          fontSize: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px var(--color-primary-glow)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.8 : 1
        }}
      >
        {isLoading ? (
          <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
        ) : (
          <>
            <span>🔒 Secure Checkout 💸</span>
          </>
        )}
      </button>
    </div>
  )

  // Render Step 3: Order Confirmation details
  const renderConfirmationStep = () => (
    <div className="confirm-step">
      <div className="success-badge">🎉</div>
      <h2 className="checkout-title" style={{ textAlign: 'center', marginBottom: '12px' }}>Order Confirmed! 🥳</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
        Thank you for your purchase. Your payment was processed successfully.
      </p>

      <div className="confirm-details glass-panel" style={{ width: '100%', padding: '20px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="confirm-row">
          <span className="confirm-label">Order ID:</span>
          <span className="confirm-val highlight">{orderId}</span>
        </div>
        <div className="confirm-row" style={{ marginTop: '8px' }}>
          <span className="confirm-label">Grand Total:</span>
          <span className="confirm-val">₹ {totalPrice}</span>
        </div>
        <div className="confirm-row" style={{ marginTop: '8px' }}>
          <span className="confirm-label">Estimated Delivery:</span>
          <span className="confirm-val">5-7 Business Days</span>
        </div>
        <div className="confirm-row" style={{ marginTop: '8px' }}>
          <span className="confirm-label">Deliver To:</span>
          <span className="confirm-val">{address.name}</span>
        </div>
      </div>

      <div className="confirm-actions" style={{ marginTop: '28px' }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-primary)',
            color: 'var(--color-primary)',
            flex: 1,
            padding: '12px',
            borderRadius: '10px'
          }}
        >
          📦 View Orders
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            flex: 1,
            padding: '12px',
            borderRadius: '10px'
          }}
        >
          🛍️ Continue Shopping
        </button>
      </div>
    </div>
  )

  const steps = [
    { num: 1, label: "📍 Address" },
    { num: 2, label: "💳 Payment" },
    { num: 3, label: "🎉 Confirm" }
  ]

  return (
    <div className="checkout-steps-container" id="checkout-page-container">
      {/* 3-step progress bar */}
      <div className="step-indicator">
        {steps.map((s, index) => (
          <React.Fragment key={s.num}>
            <div className="step-node">
              <div className={`step-circle ${step >= s.num ? 'active' : 'inactive'}`}>
                {s.num}
              </div>
              <span className={`step-label ${step >= s.num ? 'active' : ''}`}>{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${step > s.num ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {itemsToBuy.length === 0 && step !== 3 ? (
        <div className="checkout-panel" style={{ textAlign: 'center' }}>
          <div className="empty-state">
            <h3>No items to checkout</h3>
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: '20px', background: 'var(--gradient-primary)', color: 'white' }}
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="checkout-panel">
          {step === 1 && renderAddressStep()}
          {step === 2 && renderPaymentStep()}
          {step === 3 && renderConfirmationStep()}
        </div>
      )}
    </div>
  )
}

export default Checkout