import { supabase } from '../lib/supabaseClient'

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('userId, username, lastName, firstName, user_type, record_status, stamp')
    .order('userId')

  if (error) {
    console.error('Get all users error', error)
    throw error
  }

  return data || []
}

export async function activateUser(userId) {
  const now = new Date()
  const stamp = `ACTIVATED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error } = await supabase
    .from('user')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('userId', userId)

  if (error) {
    console.error('Activate user error', error)
    throw error
  }

  return { userId }
}

export async function deactivateUser(userId) {
  const now = new Date()
  const stamp = `DEACTIVATED ${now.toISOString().replace('T', ' ').split('.')[0]}`

  const { error } = await supabase
    .from('user')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('userId', userId)

  if (error) {
    console.error('Deactivate user error', error)
    throw error
  }

  return { userId }
}
