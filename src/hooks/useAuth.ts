import { useState, useEffect } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Accesso effettuato con successo!')
      router.push('/dashboard')
      return result.user
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      toast.success('Registrazione completata!')
      router.push('/dashboard')
      return result.user
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      toast.success('Accesso effettuato con successo!')
      router.push('/dashboard')
      return result.user
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      toast.success('Logout effettuato')
      router.push('/')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  }
}