import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zcaabteyobabratetdsc.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjYWFidGV5b2JhYnJhdGV0ZHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzE3MTYsImV4cCI6MjA1ODg0NzcxNn0.BobZBc2fQzqNDKmXkwqrUihmxtwzKOWbj07cdcVQOtk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
