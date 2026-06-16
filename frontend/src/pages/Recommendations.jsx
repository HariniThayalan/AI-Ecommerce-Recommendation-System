import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

function Recommendations() {
  const [allProducts, setAllProducts] = useState([])
  const [collabRecs, setCollabRecs] = useState([])
  const [rankingRecs, setRankingRecs] = useState([])
  const [contentRecs, setContentRecs] = useState([])
  
  const [targetProduct, setTargetProduct] = useState('')
  const [activeTab, setActiveTab] = useState('collaborative')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [ratingFilter, setRatingFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  
  // Custom states that trigger the backend query
  const [customPriceMin, setCustomPriceMin] = useState('')
  const [customPriceMax, setCustomPriceMax] = useState('')
  const [customRatingMin, setCustomRatingMin] = useState('')
  const [customRatingMax, setCustomRatingMax] = useState('')

  // Local typed states for real-time keystroke rendering (no delay/no blink)
  const [typedPriceMin, setTypedPriceMin] = useState('')
  const [typedPriceMax, setTypedPriceMax] = useState('')
  const [typedRatingMin, setTypedRatingMin] = useState('')
  const [typedRatingMax, setTypedRatingMax] = useState('')

  const { cart } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  // Debounce typed inputs to prevent backend spam and layout blinks
  useEffect(() => {
    const handler = setTimeout(() => {
      setCustomPriceMin(typedPriceMin)
      setCustomPriceMax(typedPriceMax)
      setCustomRatingMin(typedRatingMin)
      setCustomRatingMax(typedRatingMax)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [typedPriceMin, typedPriceMax, typedRatingMin, typedRatingMax])

  // Compute filtered ranking items (we display backend results directly, but fallback check is clean)
  const filteredRankingRecs = rankingRecs

  // Pre-fetch products to map IDs/Names to details
  useEffect(() => {
    axios.get('https://ai-ecommerce-recommendation-system.onrender.com/products')
      .then(res => {
        const productsList = res.data || []
        setAllProducts(productsList)
        if (productsList.length > 0) {
          // Set initial target product for content-based recommendations
          setTargetProduct(productsList[0].name)
        }
      })
      .catch(err => console.error('Failed to pre-fetch products catalog', err))
  }, [])

  const fetchRecommendations = async (
    overrideProduct,
    ratingF = ratingFilter,
    priceF = priceFilter,
    cPriceMin = customPriceMin,
    cPriceMax = customPriceMax,
    cRatingMin = customRatingMin,
    cRatingMax = customRatingMax
  ) => {
    setIsLoading(true)
    setError(null)
    const productQuery = overrideProduct || targetProduct
    
    // Construct dynamic user history from active cart & checkout history
    const cartIds = cart.map(item => item.id)
    const purchaseHistoryKey = user ? `purchase_history_${user.uid}` : 'purchase_history_guest'
    const purchaseIds = JSON.parse(localStorage.getItem(purchaseHistoryKey) || '[]')
    const combinedHistory = Array.from(new Set([...cartIds, ...purchaseIds]))
    
    const numericUserId = user ? (parseInt(user.uid.replace(/\D/g, '')) || 9999) : 9999

    try {
      const payload = {
        user_id: numericUserId,
        cart_items: combinedHistory,
        product_name: productQuery,
        price_range: priceF,
        rating_range: ratingF
      }

      if (priceF === 'custom') {
        payload.price_min = cPriceMin ? parseFloat(cPriceMin) : 0
        payload.price_max = cPriceMax ? parseFloat(cPriceMax) : 999999
      }
      if (ratingF === 'custom') {
        payload.rating_min = cRatingMin ? parseFloat(cRatingMin) : 0
        payload.rating_max = cRatingMax ? parseFloat(cRatingMax) : 5
      }

      const response = await axios.post(
        'https://ai-ecommerce-recommendation-system.onrender.com/recommend',
        payload
      )
      
      const data = response.data
      
      // 1. Map Collaborative Filtering (objects returned by backend)
      setCollabRecs(data.collaborative || [])

      // 2. Map Ranking-Based Filtering (objects returned by backend)
      setRankingRecs(data.ranking || [])

      // 3. Map Content-Based Similarity (objects returned by backend)
      setContentRecs(data.content || [])

    } catch (err) {
      console.error(err)
      setError('Unable to generate recommendations. Please ensure the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger recommendations once products load, cart updates, or filters change
  useEffect(() => {
    if (allProducts.length > 0) {
      fetchRecommendations(
        targetProduct || allProducts[0].name,
        ratingFilter,
        priceFilter,
        customPriceMin,
        customPriceMax,
        customRatingMin,
        customRatingMax
      )
    }
  }, [allProducts, cart, ratingFilter, priceFilter, customPriceMin, customPriceMax, customRatingMin, customRatingMax])

  const handleProductChange = (e) => {
    const val = e.target.value
    setTargetProduct(val)
    fetchRecommendations(val)
  }

  return (
    <div className="rec-container" id="recommendations-page-container">
      <h1>AI Recommendation Hub</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Discover products across our three advanced filtering models: Collaborative, Rating-Based, and Content-Based.
      </p>

      {/* Tabs navigation */}
      <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '32px' }} id="rec-tabs">
        <button 
          className={`tab-btn ${activeTab === 'collaborative' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaborative')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'collaborative' ? 'var(--gradient-primary)' : 'transparent' }}
        >
          🤝 Collaborative Filtering
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'ranking' ? 'var(--gradient-primary)' : 'transparent' }}
        >
          📈 Ranking-Based
        </button>
        <button 
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'content' ? 'var(--gradient-primary)' : 'transparent' }}
        >
          🏷️ Content-Based Similarity
        </button>
      </div>

      {error && (
        <div className="error-card">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={() => fetchRecommendations()}>Retry Analysis</button>
        </div>
      )}

      {!error && (
        <div className="recommendations-results">
          
          {/* 1. COLLABORATIVE FILTERING TAB */}
          {activeTab === 'collaborative' && (
            <div>
              <div className="section-header">
                <h2>Collaborative Recommendations</h2>
                <p className="subtitle">Based on preferences and purchase habits of users similar to you.</p>
              </div>
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing recommendation matrix...</p>
                </div>
              ) : collabRecs.length === 0 ? (
                <div className="empty-state">No collaborative recommendations computed.</div>
              ) : (
                <div className="grid">
                  {collabRecs.map(product => (
                    <ProductCard key={`collab-${product.id}`} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. RANKING-BASED FILTERING TAB */}
          {activeTab === 'ranking' && (
            <div>
              <div className="section-header">
                <h2>Top-Ranked Popular Items</h2>
                <p className="subtitle">Our most popular items rated highly across the entire community.</p>
              </div>

              {/* Range Filters Select Dropdowns */}
              <div className="glass-panel filter-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter by Rating Range:</label>
                  <select 
                    id="filter-rating-select"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      background: 'var(--bg-glass-input)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all" style={{ background: 'var(--bg-secondary)', color: 'white' }}>⭐ All Ratings</option>
                    <option value="4.5-5.0" style={{ background: 'var(--bg-secondary)', color: 'white' }}>4.5 ★ to 5.0 ★</option>
                    <option value="4.0-4.5" style={{ background: 'var(--bg-secondary)', color: 'white' }}>4.0 ★ to 4.5 ★</option>
                    <option value="3.5-4.0" style={{ background: 'var(--bg-secondary)', color: 'white' }}>3.5 ★ to 4.0 ★</option>
                    <option value="3.0-3.5" style={{ background: 'var(--bg-secondary)', color: 'white' }}>3.0 ★ to 3.5 ★</option>
                    <option value="0-3.0" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Under 3.0 ★</option>
                    <option value="custom" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Custom Rating Range...</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter by Price Range:</label>
                  <select 
                    id="filter-price-select"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      background: 'var(--bg-glass-input)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all" style={{ background: 'var(--bg-secondary)', color: 'white' }}>₹ All Prices</option>
                    <option value="0-100" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Under ₹100</option>
                    <option value="100-500" style={{ background: 'var(--bg-secondary)', color: 'white' }}>₹100 - ₹500</option>
                    <option value="500-1000" style={{ background: 'var(--bg-secondary)', color: 'white' }}>₹500 - ₹1000</option>
                    <option value="1000-999999" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Over ₹1000</option>
                    <option value="custom" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Custom Price Range...</option>
                  </select>
                </div>
              </div>

              {/* Custom Range Inputs */}
              {(priceFilter === 'custom' || ratingFilter === 'custom') && (
                <div className="glass-panel filter-panel" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap', border: '1px dashed var(--border-glass)' }}>
                  {priceFilter === 'custom' && (
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Custom Price Range (₹):</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          placeholder="Min"
                          value={typedPriceMin}
                          onChange={(e) => setTypedPriceMin(e.target.value)}
                          style={{
                            width: '100%',
                            fontFamily: 'var(--font-sans)',
                            background: 'var(--bg-glass-input)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            outline: 'none'
                          }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={typedPriceMax}
                          onChange={(e) => setTypedPriceMax(e.target.value)}
                          style={{
                            width: '100%',
                            fontFamily: 'var(--font-sans)',
                            background: 'var(--bg-glass-input)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {ratingFilter === 'custom' && (
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Custom Rating Range (0-5 ★):</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          placeholder="Min"
                          value={typedRatingMin}
                          onChange={(e) => setTypedRatingMin(e.target.value)}
                          style={{
                            width: '100%',
                            fontFamily: 'var(--font-sans)',
                            background: 'var(--bg-glass-input)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            outline: 'none'
                          }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>to</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          placeholder="Max"
                          value={typedRatingMax}
                          onChange={(e) => setTypedRatingMax(e.target.value)}
                          style={{
                            width: '100%',
                            fontFamily: 'var(--font-sans)',
                            background: 'var(--bg-glass-input)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grid with Inline Loading Overlay */}
              <div style={{ position: 'relative', minHeight: '200px' }}>
                {isLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 10, 12, 0.45)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px'
                  }}>
                    <div className="spinner" style={{ marginBottom: '12px' }}></div>
                    <p style={{ color: 'white', fontWeight: 600 }}>Analyzing recommendation matrix...</p>
                  </div>
                )}
                
                <div style={{ opacity: isLoading ? 0.35 : 1, transition: 'opacity 0.25s ease-in-out' }}>
                  {filteredRankingRecs.length === 0 ? (
                    <div className="empty-state">No trending items match your rating or price range filters.</div>
                  ) : (
                    <div className="grid">
                      {filteredRankingRecs.map(product => (
                        <ProductCard key={`ranking-${product.id}`} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. CONTENT-BASED FILTERING TAB */}
          {activeTab === 'content' && (
            <div>
              <div className="section-header">
                <h2>Content-Based Similarity</h2>
                <p className="subtitle">Recommending similar items based on item tag correlations and descriptions.</p>
              </div>

              {/* Product Selector Dropdown */}
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }} id="content-filter-selector">
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select a product to view similar items:</label>
                <select 
                  id="rec-product-dropdown"
                  value={targetProduct} 
                  onChange={handleProductChange}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    padding: '12px',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {allProducts.map(p => (
                    <option key={p.id} value={p.name} style={{ background: 'var(--bg-secondary)', color: 'white' }}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing recommendation matrix...</p>
                </div>
              ) : contentRecs.length === 0 ? (
                <div className="empty-state">No similar content recommendations computed.</div>
              ) : (
                <div className="grid">
                  {contentRecs.map(product => (
                    <ProductCard key={`content-${product.id}`} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default Recommendations