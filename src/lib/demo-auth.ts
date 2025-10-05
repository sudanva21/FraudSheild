// Demo authentication system for FraudShield
// This replaces Supabase auth for demo purposes

export interface User {
  id: string
  email: string
  user_metadata?: any
}

export interface Session {
  user: User
  access_token: string
  expires_at: number
}

class DemoAuth {
  private session: Session | null = null
  private listeners: Array<(session: Session | null) => void> = []

  constructor() {
    // Load session from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo_session')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.expires_at > Date.now()) {
            this.session = parsed
          } else {
            localStorage.removeItem('demo_session')
          }
        } catch (e) {
          localStorage.removeItem('demo_session')
        }
      }
    }
  }

  // Demo user credentials
  private demoUsers = [
    { email: 'demo@fraudshield.com', password: 'demo123' },
    { email: 'admin@fraudshield.com', password: 'admin123' },
    { email: 'test@example.com', password: 'test123' },
  ]

  signIn = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const user = this.demoUsers.find(u => u.email === email && u.password === password)
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Invalid email or password' } 
      }
    }

    const session: Session = {
      user: {
        id: `user_${email.split('@')[0]}`,
        email: email,
        user_metadata: {}
      },
      access_token: `demo_token_${Date.now()}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }

    this.session = session

    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_session', JSON.stringify(session))
    }

    this.notifyListeners(session)

    return { data: { user: session.user, session }, error: null }
  }

  signUp = async (email: string, password: string, userData?: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // For demo, automatically "register" any email
    const session: Session = {
      user: {
        id: `user_${email.split('@')[0]}_${Date.now()}`,
        email: email,
        user_metadata: userData || {}
      },
      access_token: `demo_token_${Date.now()}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }

    this.session = session

    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_session', JSON.stringify(session))
    }

    this.notifyListeners(session)

    return { data: { user: session.user, session }, error: null }
  }

  signOut = async () => {
    this.session = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_session')
    }

    this.notifyListeners(null)

    return { error: null }
  }

  getSession = () => {
    return this.session
  }

  getUser = () => {
    return this.session?.user || null
  }

  onAuthStateChange = (callback: (session: Session | null) => void) => {
    this.listeners.push(callback)
    
    // Immediately call with current session
    callback(this.session)

    return {
      data: { subscription: { unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== callback)
      }}},
    }
  }

  private notifyListeners = (session: Session | null) => {
    this.listeners.forEach(listener => listener(session))
  }
}

export const demoAuth = new DemoAuth()

// Export functions to match Supabase API
export const signIn = demoAuth.signIn
export const signUp = demoAuth.signUp  
export const signOut = demoAuth.signOut
export const getCurrentUser = () => demoAuth.getUser()
export const getSession = () => demoAuth.getSession()