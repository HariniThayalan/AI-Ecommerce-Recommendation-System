import { createContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if there's a stored demo session first
    const storedDemoUser = localStorage.getItem('demo_user')
    if (storedDemoUser) {
      setUser(JSON.parse(storedDemoUser))
      setIsDemoMode(true)
      setIsLoading(false)
      return
    }

    // Otherwise, listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isDemo: false
        })
        setIsDemoMode(false)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }, (error) => {
      console.warn("Firebase Auth error: ", error)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const loginWithFirebase = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signupWithFirebase = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const loginDemo = () => {
    const demoUser = {
      uid: 'demo-user-id-12345',
      email: 'demo@auramart.com',
      isDemo: true
    }
    localStorage.setItem('demo_user', JSON.stringify(demoUser))
    setUser(demoUser)
    setIsDemoMode(true)
  }

  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demo_user')
      setUser(null)
      setIsDemoMode(false)
    } else {
      await signOut(auth)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode,
        loginWithFirebase,
        signupWithFirebase,
        loginDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
