import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import Recommendations from './pages/Recommendations'
import ProductDetails from './pages/ProductDetails'

import Navbar from './components/Navbar'
import ChatBot from './components/ChatBot'
import Orders from "./pages/Orders";

import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>

          <Navbar />

          <main className="main-content">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/cart' element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/success' element={<PaymentSuccess />} />
            <Route path='/recommendations' element={<Recommendations />} />
            <Route path='/product/:id' element={<ProductDetails />} />
          </Routes>
        </main>

        <ChatBot />
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  )
}

export default App