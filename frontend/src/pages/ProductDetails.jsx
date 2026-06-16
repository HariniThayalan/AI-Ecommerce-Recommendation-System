import { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CartContext } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)

  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Fetch product details and recommendations
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setFeedbackMsg('')

    axios.get(`https://ai-ecommerce-recommendation-system.onrender.com/products/${id}`)
      .then(res => {
        setProduct(res.data)
        
        // Fetch recommendations for this product based on content similarity
        axios.post('https://ai-ecommerce-recommendation-system.onrender.com/recommend', {
          product_name: res.data.name
        })
        .then(recRes => {
          // Use content-based recommendations, exclude the current product
          const recs = (recRes.data.content || []).filter(p => p.id !== res.data.id)
          setRecommendations(recs.slice(0, 4)) // Keep top 4 related items
        })
        .catch(recErr => {
          console.error("Failed to fetch related products", recErr)
        })
      })
      .catch(err => {
        console.error(err)
        setError("Failed to load product details. Please ensure the backend is running.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product)
      setFeedbackMsg('✨ Added to Cart successfully!')
      setTimeout(() => setFeedbackMsg(''), 3000)
    }
  }

  const handleBuyNow = () => {
    if (product) {
      navigate('/checkout', { state: { buyNowProduct: product } })
    }
  }

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Revealing product secrets...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="error-card">
        <p className="error-message">⚠️ {error || "Product not found"}</p>
        <Link to="/"><button>Return to Catalog</button></Link>
      </div>
    )
  }

  const starsFull = Math.round(product.rating || 0)
  const starsEmpty = 5 - starsFull

  return (
    <div className="details-page-container">
      {/* Back button */}
      <Link to="/" className="back-link">
        <span>←</span> Back to Catalog
      </Link>

      <div className="details-split-grid">
        {/* Left Side: Product Image */}
        <div className="details-image-panel glass-panel">
          <div className="details-image-wrapper">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        {/* Right Side: Product Details & Actions */}
        <div className="details-info-panel glass-panel">
          <div className="details-meta-row">
            <span className="details-badge category-badge">{product.category}</span>
            {product.brand && <span className="details-badge brand-badge">By {product.brand}</span>}
          </div>

          <h1 className="details-title">{product.name}</h1>

          <div className="details-rating-row">
            <span className="details-rating-stars">
              {'★'.repeat(starsFull) + '☆'.repeat(starsEmpty)}
            </span>
            <span className="details-rating-value">{(product.rating || 0).toFixed(1)}</span>
            <span className="details-rating-count">({product.reviews?.length || 0} customer reviews)</span>
          </div>

          <div className="details-price-card">
            <span className="price-label">Price:</span>
            <span className="price-val">₹ {product.price}</span>
          </div>

          <div className="details-description-section">
            <h3>Product Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Action buttons */}
          <div className="details-actions-group">
            <button 
              id="details-add-to-cart"
              onClick={handleAddToCart}
              className="details-btn-cart"
            >
              🛍️ Add To Cart
            </button>
            <button 
              id="details-buy-now"
              onClick={handleBuyNow}
              className="details-btn-buy"
            >
              ⚡ Buy Now
            </button>
          </div>

          {feedbackMsg && (
            <div className="feedback-toast-inline">
              {feedbackMsg}
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="details-reviews-section glass-panel">
        <h2>Customer Reviews & Ratings</h2>
        
        <div className="reviews-summary-block">
          <div className="average-rating-badge">
            <span className="big-rating-num">{(product.rating || 0).toFixed(1)}</span>
            <span className="star-display">{'★'.repeat(starsFull) + '☆'.repeat(starsEmpty)}</span>
            <span className="total-reviews-count">{product.reviews?.length || 0} Ratings</span>
          </div>
        </div>

        <div className="reviews-list">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{rev.reviewer}</span>
                  <span className="review-date">{rev.date}</span>
                </div>
                <div className="review-rating-stars">
                  {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                </div>
                <p className="review-comment">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews-msg">No reviews yet for this product. Be the first to share your experience!</p>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {recommendations.length > 0 && (
        <div className="related-products-section">
          <div className="section-header">
            <h2>You May Also Like</h2>
            <p className="subtitle">Similar items calculated from content feature correlations</p>
          </div>
          <div className="grid">
            {recommendations.map(item => (
              <ProductCard key={`related-${item.id}`} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
