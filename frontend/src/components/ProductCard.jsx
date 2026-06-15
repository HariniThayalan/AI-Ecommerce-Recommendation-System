import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'

function ProductCard({ product }) {

  const { addToCart } = useContext(CartContext)
  const starsFull = Math.round(product.rating || 0)
  const starsEmpty = 5 - starsFull

  return (
    <div className='card' id={`product-card-${product.id}`}>

      <Link to={`/product/${product.id}`} className="card-img-link">
        <div className='card-img-wrapper'>
          <img src={product.image} alt={product.name} />
        </div>
      </Link>

      <Link to={`/product/${product.id}`} className="card-title-link">
        <h3>{product.name}</h3>
      </Link>

      <div className="product-card-rating">
        <span className="rating-stars">
          {'★'.repeat(starsFull) + '☆'.repeat(starsEmpty)}
        </span>
        <span className="rating-val">{(product.rating || 0).toFixed(1)}</span>
      </div>

      <p>₹ {product.price}</p>

      <button 
        id={`add-to-cart-btn-${product.id}`}
        onClick={() => addToCart(product)}
      >
        Add To Cart
      </button>

    </div>
  )
}

export default ProductCard