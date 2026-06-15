import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

function Cart() {
  const { cart, removeFromCart } = useContext(CartContext)
  const navigate = useNavigate()

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="cart-container" id="cart-page-container">
      <h1>🛒 Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="empty-state" id="cart-empty-state">
          <h3>📭 Your cart is empty</h3>
          <p>Discover products and add them to your cart to checkout.</p>
          <button 
            id="cart-empty-home-btn"
            onClick={() => navigate('/')} 
            style={{ marginTop: '20px', background: 'var(--gradient-primary)' }}
          >
            ✨ Start Shopping 🛍️
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cart.map((item, index) => (
              <div 
                className="cart-item" 
                key={`${item.id}-${index}`}
                id={`cart-item-${item.id}`}
                style={{ gap: '16px', flexWrap: 'wrap' }}
              >
                {/* Product Info with Image */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-glass)'
                    }}
                  />
                  <div className="cart-item-info">
                    <h3 
                      style={{ fontSize: '1.05rem', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <span className="cart-price">₹ {item.price}</span>
                  </div>
                </div>

                {/* Actions: Buy this item or Remove */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    id={`cart-buy-now-btn-${item.id}`}
                    onClick={() => navigate('/checkout', { state: { buyNowProduct: item } })}
                    style={{
                      background: 'var(--gradient-cyan)',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(6, 182, 212, 0.2)'
                    }}
                  >
                    ⚡ Buy Now
                  </button>
                  <button 
                    id={`cart-remove-btn-${item.id}`}
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      borderRadius: '8px'
                    }}
                  >
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '24px', marginTop: '32px' }} id="cart-summary-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>🏷️ Total Price:</span>
              <span style={{ color: 'var(--color-secondary)' }}>₹ {totalPrice}</span>
            </div>
            <button 
              id="cart-checkout-btn"
              className="checkout-btn" 
              onClick={() => navigate('/checkout')}
            >
              🚀 Proceed to Checkout ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart