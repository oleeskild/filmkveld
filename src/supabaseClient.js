import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cglhoqzfqozwbbglebcy.supabase.co'
const supabaseAnonKey = 'sb_publishable_jRwi6WVVz0-ALX9N0EBRaQ_IbddEN5w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
