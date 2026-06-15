import { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [cart, setCart] = useState([])

  // Get active key based on user state
  const getCartKey = () => {
    return user ? `cart_${user.uid}` : 'cart_guest'
  }

  // Load and merge cart on mount and user change
  useEffect(() => {
    // 1. One-time migration from old global 'cart' key
    const oldCart = localStorage.getItem('cart')
    if (oldCart) {
      try {
        const parsedOld = JSON.parse(oldCart)
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          const existingGuest = localStorage.getItem('cart_guest')
          const parsedGuest = existingGuest ? JSON.parse(existingGuest) : []
          localStorage.setItem('cart_guest', JSON.stringify([...parsedGuest, ...parsedOld]))
        }
      } catch (e) {
        console.error("Failed to migrate old cart", e)
      }
      localStorage.removeItem('cart')
    }

    // 2. Load appropriate cart
    if (user) {
      // User is logged in
      const userCartKey = `cart_${user.uid}`
      const savedUserCart = localStorage.getItem(userCartKey)
      let userCart = savedUserCart ? JSON.parse(savedUserCart) : []

      // Check if guest cart has items to merge
      const savedGuestCart = localStorage.getItem('cart_guest')
      const guestCart = savedGuestCart ? JSON.parse(savedGuestCart) : []

      if (guestCart.length > 0) {
        userCart = [...userCart, ...guestCart]
        localStorage.setItem(userCartKey, JSON.stringify(userCart))
        localStorage.removeItem('cart_guest')
      }
      setCart(userCart)
    } else {
      // Guest
      const savedGuestCart = localStorage.getItem('cart_guest')
      setCart(savedGuestCart ? JSON.parse(savedGuestCart) : [])
    }
  }, [user])

  const addToCart = (product) => {
    const key = getCartKey()
    const currentCart = JSON.parse(localStorage.getItem(key) || '[]')
    const updatedCart = [...currentCart, product]
    setCart(updatedCart)
    localStorage.setItem(key, JSON.stringify(updatedCart))
  }

  const removeFromCart = (id) => {
    const key = getCartKey()
    const currentCart = JSON.parse(localStorage.getItem(key) || '[]')
    const updatedCart = currentCart.filter(item => item.id !== id)
    setCart(updatedCart)
    localStorage.setItem(key, JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    const key = getCartKey()
    setCart([])
    localStorage.removeItem(key)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}