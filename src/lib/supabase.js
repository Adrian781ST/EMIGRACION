import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xivrcjdgpcqqnxvuqamg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__sv2u4mVAItUhTcANSnfsg_2vIeQgRg'

// Debug: Log Supabase configuration on load
console.log('Supabase Client initialized:')
console.log('  URL:', supabaseUrl)
console.log('  Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')
console.log('  Using env vars:', !!import.meta.env.VITE_SUPABASE_URL, !!import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
