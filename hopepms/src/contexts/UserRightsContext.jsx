import { createContext, useEffect, useState, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContext'

export const UserRightsContext = createContext({})

export function UserRightsProvider({ children }) {
  const { currentUser } = useContext(AuthContext)
  const [rights, setRights] = useState(null)
  const [rightsLoading, setRightsLoading] = useState(true)

  useEffect(() => {
    const fetchRights = async () => {
      if (!currentUser?.userId) {
        setRights(null)
        setRightsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('UserModule_Rights')
        .select('Right_ID, Right_value')
        .eq('userid', currentUser.userId)
        .eq('Record_status', 'ACTIVE')

      if (error) {
        console.error('Fetch user rights error', error)
        setRights({})
        setRightsLoading(false)
        return
      }

      const rightsMap = {}
      data.forEach((row) => {
        rightsMap[row.Right_ID] = row.Right_value
      })
      setRights(rightsMap)
      setRightsLoading(false)
    }

    fetchRights()
  }, [currentUser])

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}
