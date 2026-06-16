import { useEffect, useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

// Helper to get seasonal timing range
const getSeasonalTimerRange = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return [2, 4]; // Spring: 2-4 hours
  if (month >= 5 && month <= 7) return [1, 3]; // Summer: 1-3 hours
  if (month >= 8 && month <= 10) return [3, 5]; // Autumn: 3-5 hours
  return [4, 6]; // Winter: 4-6 hours
};

// Helper to get season name
const getSeasonName = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
};

function Home() {
  const { user, loginWithFirebase, signupWithFirebase, loginDemo } = useContext(AuthContext)
  const navigate = useNavigate()

  // State Management
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Custom states for premium widgets
  const [currentSlide, setCurrentSlide] = useState(0)
  const [authMode, setAuthMode] = useState('login')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [subscribedEmail, setSubscribedEmail] = useState('')
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Static Slides data
  const slides = [
    {
      title: "Elevate Your Aesthetics",
      subtitle: "Discover high-fidelity cosmetics & skincare curated just for you.",
      badge: "New Collection",
      buttonText: "Discover Skincare",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80",
      category: "Skincare"
    },
    {
      title: "Intelligent Recommendations",
      subtitle: "Let our advanced Collaborative Filtering engine personalize your feed.",
      badge: "AI Powered",
      buttonText: "View Recommendation Hub",
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&q=80",
      navigatePath: "/recommendations"
    },
    {
      title: "Sleek Shaving & Grooming",
      subtitle: "Premium razors and grooming essentials for the modern look.",
      badge: "Trending Now",
      buttonText: "Shop Hair & Shave",
      image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=1200&q=80",
      category: "Hair Care"
    }
  ]

  // Auto-advance Slider Effect
  useEffect(() => {
    if (!user) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [user])

  // Countdown Timer Effect: Random timer generated per session on login, adjusted season-wise
  useEffect(() => {
    if (!user) return

    // Get stable target end time from sessionStorage or generate a new random one
    const userSessionKey = `flash_deal_end_${user.uid || user.email}`
    const savedEndTime = sessionStorage.getItem(userSessionKey)
    let targetTime

    if (savedEndTime) {
      targetTime = new Date(savedEndTime)
    } else {
      const [minHours, maxHours] = getSeasonalTimerRange()
      
      // Random hours, minutes, seconds within the seasonal range
      const randomHours = Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours
      const randomMinutes = Math.floor(Math.random() * 60)
      const randomSeconds = Math.floor(Math.random() * 60)
      
      const durationMs = ((randomHours * 3600) + (randomMinutes * 60) + randomSeconds) * 1000
      targetTime = new Date(Date.now() + durationMs)
      
      sessionStorage.setItem(userSessionKey, targetTime.toISOString())
    }

    const updateCountdown = () => {
      const remainingMs = targetTime.getTime() - Date.now()

      if (remainingMs <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 })
      } else {
        const totalSeconds = Math.floor(remainingMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        setCountdown({ hours, minutes, seconds })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [user])

  // Fetch Catalog Data
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    axios.get('https://ai-ecommerce-recommendation-system.onrender.com/products')
      .then(res => {
        setProducts(res.data || [])
        setError(null)
      })
      .catch(err => {
        console.error(err)
        setError('Unable to load products. Please check if the backend server is running.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [user])

  // Split-screen Embedded Authentication handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in all fields.')
      return
    }
    setAuthError('')
    setIsAuthLoading(true)

    try {
      if (authMode === 'login') {
        await loginWithFirebase(emailInput, passwordInput)
      } else {
        await signupWithFirebase(emailInput, passwordInput)
      }
    } catch (err) {
      console.error(err)
      setAuthError(err.message || 'Authentication error. Please check setup or try Demo Mode.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  // Handle Newsletter Subscribe
  const handleSubscribeSubmit = (e) => {
    e.preventDefault()
    if (subscribedEmail) {
      alert(`Welcome to the fold! ${subscribedEmail} has been registered for discount alerts.`)
      setSubscribedEmail('')
    }
  }

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    // Search Query Filter
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Category Filter
    if (selectedCategory === 'All') return true
    const name = product.name.toLowerCase()
    
    if (selectedCategory === 'Cosmetics') {
      return name.includes('nail') || name.includes('polish') || name.includes('lacquer') || 
             name.includes('lipstick') || name.includes('lip') || name.includes('blush') || 
             name.includes('makeup') || name.includes('mascara') || name.includes('powder')
    }
    if (selectedCategory === 'Skincare') {
      return name.includes('lotion') || name.includes('cream') || name.includes('skincare') || 
             name.includes('moisturizer') || name.includes('soap') || name.includes('wash')
    }
    if (selectedCategory === 'Hair Care') {
      return name.includes('shampoo') || name.includes('conditioner') || name.includes('hair') || 
             name.includes('styling') || name.includes('gel')
    }
    return true
  })

  // Get seasonal Deal of the Day product
  const getSeasonalDealProduct = (productList) => {
    if (!productList || productList.length === 0) return null

    const season = getSeasonName()
    let seasonalProducts = []

    if (season === 'Spring') {
      seasonalProducts = productList.filter(p => {
        const cat = p.category?.toLowerCase() || ''
        const name = p.name?.toLowerCase() || ''
        return cat.includes('cosmetics') || name.includes('polish') || name.includes('nail')
      })
    } else if (season === 'Summer') {
      seasonalProducts = productList.filter(p => {
        const name = p.name?.toLowerCase() || ''
        return name.includes('lip') || name.includes('sun') || name.includes('gel') || name.includes('lacquer')
      })
    } else if (season === 'Autumn') {
      seasonalProducts = productList.filter(p => {
        const cat = p.category?.toLowerCase() || ''
        const name = p.name?.toLowerCase() || ''
        return cat.includes('hair') || name.includes('shampoo') || name.includes('conditioner') || name.includes('shave') || name.includes('razor')
      })
    } else { // Winter
      seasonalProducts = productList.filter(p => {
        const cat = p.category?.toLowerCase() || ''
        const name = p.name?.toLowerCase() || ''
        return cat.includes('skincare') || name.includes('cream') || name.includes('lotion') || name.includes('moisturizer')
      })
    }

    if (seasonalProducts.length === 0) {
      return productList[0]
    }

    // Dynamic but stable selection per user session using the date or user id hash
    const stableSeed = user ? (user.uid || user.email || '1').charCodeAt(0) : 1
    const dayIndex = new Date().getDate()
    const selectIndex = (stableSeed + dayIndex) % seasonalProducts.length

    return seasonalProducts[selectIndex]
  }

  const dealProduct = getSeasonalDealProduct(products)

  // Season-specific badge text
  const currentSeasonName = getSeasonName()
  const seasonBadgeText = 
    currentSeasonName === 'Spring' ? '🌸 Fresh Spring Deal - 40% Off' :
    currentSeasonName === 'Summer' ? '☀️ Hot Summer Deal - 40% Off' :
    currentSeasonName === 'Autumn' ? '🍂 Crisp Autumn Deal - 40% Off' :
    '❄️ Cozy Winter Deal - 40% Off'

  return (
    <div className="home-container">
      
      {!user ? (
        /* ==================== LOGGED OUT VIEW ==================== */
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Landing Grid Portal */}
          <div className="landing-split">
            
            {/* Left side: Premium Branding & Feature lists */}
            <div className="landing-info-pane">
              <h2>Experience the Future of E-Commerce at AuraMart</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.6' }}>
                AuraMart is an advanced shopping ecosystem combining luxury visual design with custom machine learning recomendations and interactive chatbot helpers.
              </p>

              <div className="feature-pill-list">
                <div className="feature-pill">
                  <span className="feature-pill-icon">🎯</span>
                  <div className="feature-pill-content">
                    <h3>Machine Learning Personalization</h3>
                    <p>We build individual preference maps using Collaborative and Content-based filtering matrices.</p>
                  </div>
                </div>

                <div className="feature-pill">
                  <span className="feature-pill-icon">💬</span>
                  <div className="feature-pill-content">
                    <h3>24/7 Smart Shopping Agent</h3>
                    <p>Get instant recommendations and item search support directly from our AI chatbot widget.</p>
                  </div>
                </div>

                <div className="feature-pill">
                  <span className="feature-pill-icon">⚡</span>
                  <div className="feature-pill-content">
                    <h3>Premium Glassmorphic Interface</h3>
                    <p>Seamless responsive layouts, instant cart state, and a frictionless simulated checkout funnel.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: direct login/register card */}
            <div className="landing-auth-card" id="embedded-landing-auth">
              <h3>{authMode === 'login' ? 'Sign In to AuraMart' : 'Create Account'}</h3>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem', marginBottom: '8px' }}>
                Join or log in to unlock our shopping catalog.
              </p>

              {authError && (
                <div className="error-card" style={{ padding: '12px', margin: '0 0 10px 0', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ color: '#f87171', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    {authError}
                  </p>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  id="landing-email"
                  type="email"
                  placeholder="Email Address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <input
                  id="landing-password"
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button type="submit" style={{ background: 'var(--gradient-primary)' }} disabled={isAuthLoading}>
                  {isAuthLoading ? 'Authenticating...' : (authMode === 'login' ? 'Sign In' : 'Register')}
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <button 
                  id="landing-demo-btn"
                  onClick={loginDemo}
                  style={{ background: 'var(--gradient-cyan)', width: '100%' }}
                >
                  🚀 Try Demo Mode (Bypass Firebase)
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {authMode === 'login' ? (
                  <>Don't have an account? <span onClick={() => { setAuthMode('signup'); setAuthError(''); }} style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 600 }}>Create one</span></>
                ) : (
                  <>Already have an account? <span onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 600 }}>Sign In</span></>
                )}
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges-bar" id="logged-out-trust-badges">
            <div className="trust-badge-item">
              <span>🔒</span> Secure SSL Checkout
            </div>
            <div className="trust-badge-item">
              <span>✈️</span> Free Standard Shipping
            </div>
            <div className="trust-badge-item">
              <span>🛡️</span> 100% Quality Assurance
            </div>
            <div className="trust-badge-item">
              <span>🤖</span> Real-time AI Assistant
            </div>
          </div>
        </div>
      ) : (
        /* ==================== LOGGED IN VIEW ==================== */
        <>
          {/* Dynamic Hero Carousel */}
          <div className="hero-slider" id="home-carousel-slider">
            {slides.map((slide, idx) => (
              <div key={idx} className={`slide ${currentSlide === idx ? 'active' : ''}`}>
                <div 
                  className="slide-bg" 
                  style={{ backgroundImage: `url(${slide.image})` }}
                ></div>
                <div className="slide-content">
                  <span className="slide-badge">{slide.badge}</span>
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <button 
                    className="slide-btn"
                    onClick={() => {
                      if (slide.category) {
                        setSelectedCategory(slide.category)
                        document.getElementById('catalog-section-header').scrollIntoView({ behavior: 'smooth' })
                      } else if (slide.navigatePath) {
                        navigate(slide.navigatePath)
                      }
                    }}
                  >
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Bullet Nav dots */}
            <div className="slide-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Deal of the Day Spotlight Widget */}
          {dealProduct && (
            <div className="deal-section" id="spotlight-deal-day">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Flash Deal of the Day</h2>
                <p className="subtitle">Extremely limited pricing on hand-picked items</p>
              </div>

              <div className="deal-container">
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img 
                    src={dealProduct.image} 
                    alt={dealProduct.name} 
                    style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                  />
                  <div className="deal-info">
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>{seasonBadgeText}</span>
                    <h3 style={{ fontSize: '1.4rem', marginTop: '4px' }}>{dealProduct.name}</h3>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '10px', fontSize: '1rem' }}>
                        ₹ {Math.round(dealProduct.price * 1.66)}
                      </span>
                      ₹ {dealProduct.price}
                    </p>
                  </div>
                </div>

                {/* Countdown display */}
                <div className="deal-timer-container">
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Offer Expires In:</span>
                  <div className="timer-units">
                    <div className="timer-unit">
                      <span className="timer-val">{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="timer-lbl">Hrs</span>
                    </div>
                    <div className="timer-unit">
                      <span className="timer-val">{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="timer-lbl">Mins</span>
                    </div>
                    <div className="timer-unit">
                      <span className="timer-val">{String(countdown.seconds).padStart(2, '0')}</span>
                      <span className="timer-lbl">Secs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catalog Section Header */}
          <div className="section-header" id="catalog-section-header">
            <h2>Trending Catalog</h2>
            <p className="subtitle">Hand-picked premium products for you</p>
          </div>

          {/* Search Engine Space */}
          <div className="search-container" id="catalog-search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                id="catalog-search-input"
                type="text"
                className="search-input"
                placeholder="Type a product name, brand, or category to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  id="catalog-search-clear-btn"
                  className="search-clear-btn" 
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Capsules */}
          <div 
            className="category-container" 
            style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '32px', paddingBottom: '8px' }}
            id="catalog-categories-bar"
          >
            {['All', 'Cosmetics', 'Skincare', 'Hair Care'].map(category => (
              <button
                key={category}
                id={`cat-capsule-${category.replace(' ', '')}`}
                className={`category-capsule ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'All' && '📦 '}
                {category === 'Cosmetics' && '💅 '}
                {category === 'Skincare' && '🧴 '}
                {category === 'Hair Care' && '💇 '}
                {category}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Curating your catalog...</p>
            </div>
          )}

          {error && (
            <div className="error-card">
              <p className="error-message">⚠️ {error}</p>
              <button onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
          )}

          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="empty-state">
              <h3>No Products Found</h3>
              <p>
                {searchQuery ? `No products match "${searchQuery}"${selectedCategory !== 'All' ? ` in the ${selectedCategory} category` : ''}.` : 'Try exploring another category.'}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button 
                  id="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  style={{ marginTop: '16px', background: 'var(--gradient-primary)' }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredProducts.length > 0 && (
            <div className="grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== COMMON SECTIONS (Newsletter & Footer) ==================== */}
      
      {/* Newsletter */}
      <div className="newsletter-section" id="news-newsletter-signup">
        <h3>Subscribe to AuraMart Insiders</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
          Receive customized notifications, limited flash-sale coupons, and new recommendation catalog briefs directly in your inbox.
        </p>
        <form onSubmit={handleSubscribeSubmit} className="newsletter-input-group">
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email address"
            value={subscribedEmail}
            onChange={(e) => setSubscribedEmail(e.target.value)}
            required
          />
          <button type="submit" id="newsletter-submit-btn">Subscribe</button>
        </form>
      </div>

      {/* Corporate Footer */}
      <footer className="footer-section" id="store-footer">
        <div className="footer-grid">
          
          <div className="footer-col">
            <h4 style={{ color: 'white', fontWeight: 800 }}>✨ AuraMart</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginTop: '10px' }}>
              Your premium gateway to intelligent, personalized shopping experiences. Leveraging advanced recommendation systems and smart conversational agents.
            </p>
          </div>

          <div className="footer-col">
            <h4>Catalog Categories</h4>
            <ul>
              <li><span style={{ cursor: 'pointer' }} onClick={() => { if(user) { setSelectedCategory('Cosmetics'); document.getElementById('catalog-section-header').scrollIntoView({ behavior: 'smooth' }); } }}>Cosmetics</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => { if(user) { setSelectedCategory('Skincare'); document.getElementById('catalog-section-header').scrollIntoView({ behavior: 'smooth' }); } }}>Skincare</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => { if(user) { setSelectedCategory('Hair Care'); document.getElementById('catalog-section-header').scrollIntoView({ behavior: 'smooth' }); } }}>Grooming & Hair</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Navigation Support</h4>
            <ul>
              <li><Link to="/">Catalog Home</Link></li>
              <li><Link to="/recommendations">AI Recommendations</Link></li>
              <li><Link to="/cart">Cart Session</Link></li>
              <li><Link to="/login">Account Portal</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Support</h4>
            <ul>
              <li><a href="#store-footer">Delivery & Shipping</a></li>
              <li><a href="#store-footer">Returns & Refunds</a></li>
              <li><a href="#store-footer">Privacy Guarantee</a></li>
              <li><a href="#store-footer">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 AuraMart Inc. All rights reserved. Powered by Advanced AI recommendation agents.</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>🔒 SSL Secured</span>
            <span>💳 Razorpay Mock Integrated</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Home