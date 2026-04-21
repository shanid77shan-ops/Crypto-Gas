import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function saveGasPrice(gasGwei) {
  if (!supabase) return
  await supabase.from('gas_history').insert({ gas_gwei: gasGwei })
}

export async function fetchGasHistory(limit = 20) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('gas_history')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data
}
