import { supabase } from '../lib/supabaseClient'

export async function getProducts() {
  const { data, error } = await supabase
    .from('product')
    .select('prodCode, description, unit, record_status, stamp')
    .eq('record_status', 'ACTIVE')
    .order('prodCode')

  if (error) {
    console.error('Get products error', error)
    throw error
  }

  return data || []
}

export async function getProductsWithPrice() {
  const { data, error } = await supabase
    .from('current_product_price')
    .select('prodCode, description, unit, record_status, unitPrice, effDate')
    .eq('record_status', 'ACTIVE')
    .order('prodCode')

  if (error) {
    console.error('Get products with price error', error)
    throw error
  }

  return data || []
}

export async function getInactiveProducts() {
  const { data, error } = await supabase
    .from('product')
    .select('prodCode, description, unit, record_status, stamp')
    .eq('record_status', 'INACTIVE')
    .order('prodCode')

  if (error) {
    console.error('Get inactive products error', error)
    throw error
  }

  return data || []
}

export async function addProduct({ prodCode, description, unit, unitPrice }) {
  const now = new Date()
  const stamp = `ADDED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error: prodError } = await supabase.from('product').insert({
    prodCode,
    description,
    unit,
    record_status: 'ACTIVE',
    stamp,
  })

  if (prodError) {
    console.error('Add product error', prodError)
    throw prodError
  }

  if (unitPrice) {
    const { error: priceError } = await supabase.from('priceHist').insert({
      effDate: new Date().toISOString().split('T')[0],
      prodCode,
      unitPrice,
      stamp,
    })

    if (priceError) {
      console.error('Add price history error', priceError)
      throw priceError
    }
  }

  return { prodCode }
}

export async function updateProduct({ prodCode, description, unit }) {
  const now = new Date()
  const stamp = `UPDATED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error } = await supabase
    .from('product')
    .update({ description, unit, stamp })
    .eq('prodCode', prodCode)

  if (error) {
    console.error('Update product error', error)
    throw error
  }

  return { prodCode }
}

export async function softDeleteProduct(prodCode) {
  const now = new Date()
  const stamp = `DEACTIVATED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error } = await supabase
    .from('product')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('prodCode', prodCode)

  if (error) {
    console.error('Soft delete product error', error)
    throw error
  }

  return { prodCode }
}

export async function recoverProduct(prodCode) {
  const now = new Date()
  const stamp = `RECOVERED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error } = await supabase
    .from('product')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('prodCode', prodCode)

  if (error) {
    console.error('Recover product error', error)
    throw error
  }

  return { prodCode }
}
