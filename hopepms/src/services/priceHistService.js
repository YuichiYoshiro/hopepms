import { supabase } from '../lib/supabaseClient'

export async function getPriceHistory(prodCode) {
  const { data, error } = await supabase
    .from('priceHist')
    .select('effDate, prodCode, unitPrice, stamp')
    .eq('prodCode', prodCode)
    .order('effDate', { ascending: false })

  if (error) {
    console.error('Get price history error', error)
    throw error
  }

  return data || []
}

export async function addPriceEntry({ prodCode, unitPrice, effDate }) {
  const now = new Date()
  const stamp = `ADDED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error } = await supabase.from('priceHist').insert({
    effDate: effDate || new Date().toISOString().split('T')[0],
    prodCode,
    unitPrice,
    stamp,
  })

  if (error) {
    console.error('Add price entry error', error)
    throw error
  }

  return { prodCode, effDate }
}
