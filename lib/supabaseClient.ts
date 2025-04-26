import { createClient } from "@supabase/supabase-js"

// Provide fallback values for static generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-for-build.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build'

// Create supabase client only if we're in a browser or have valid credentials
let supabase: any

// Only initialize client if we have real values or we're in the browser
if (
  typeof window !== 'undefined' || 
  (supabaseUrl !== 'https://placeholder-for-build.supabase.co' && 
   supabaseAnonKey !== 'placeholder-key-for-build')
) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Create a mock client for static build
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: { message: 'Mocked during build' } }),
      insert: () => ({ data: null, error: { message: 'Mocked during build' } }),
      update: () => ({ data: null, error: { message: 'Mocked during build' } }),
      delete: () => ({ data: null, error: { message: 'Mocked during build' } }),
      eq: () => ({ data: null, error: { message: 'Mocked during build' } }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    }
  }
}

export { supabase }
