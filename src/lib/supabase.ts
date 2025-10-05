import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Create a single browser client instance with retry logic
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Supabase configuration is missing')
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Supabase configuration
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Retry function for network requests
const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (i === retries - 1) throw error
      if (error?.message?.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      } else {
        throw error
      }
    }
  }
  throw new Error('Max retries exceeded')
}

// Auth helper functions with retry logic
export const signUp = async (email: string, password: string, userData?: any) => {
  return retryRequest(async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    
    return { data, error }
  })
}

export const signIn = async (email: string, password: string) => {
  return retryRequest(async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { data, error }
  })
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}