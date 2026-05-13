import { supabase } from '../lib/supabaseClient'

export async function getProductReport() {
  const { data, error } = await supabase
    .from('current_product_price')
    .select('prodCode, description, unit, unitPrice, effDate')
    .eq('record_status', 'ACTIVE')
    .order('prodCode')

  if (error) {
    console.error('Get product report error', error)
    throw error
  }

  return data || []
}

export async function getTopSelling() {
  const { data, error } = await supabase
    .from('top_selling_products')
    .select('prodCode, description, totalQty, totalRevenue')
    .order('totalQty', { ascending: false })

  if (error) {
    console.error('Get top selling error', error)
    throw error
  }

  return data || []
}
