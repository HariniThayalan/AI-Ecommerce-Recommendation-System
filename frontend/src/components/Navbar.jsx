import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

function Navbar() {
  const { cart, clearCart } = useContext(CartContext)
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className='navbar' id="main-navigation">
      <Link to='/' id="nav-logo-link">
        <h2>✨ AuraMart</h2>
      </Link>

      <div className="navbar-links">
        <Link to='/' id="nav-home-link">Home</Link>
        <Link to='/recommendations' id="nav-recommendations-link">Recommendations</Link>
        <Link to='/cart' id="nav-cart-link">
          Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </Link>
        {user && (
          <Link to="/orders" id="nav-orders-link">
            Orders
          </Link>
        )}
        {user ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} id="nav-user-email">
              {user.isDemo ? '👤 Demo Mode' : `👤 ${user.email}`}
            </span>
            <button 
              id="nav-logout-btn"
              onClick={handleLogout} 
              style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to='/login' id="nav-login-link">Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar