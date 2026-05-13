import { useContext } from 'react'
import { UserRightsContext } from '../contexts/UserRightsContext'

export function useRights() {
  const context = useContext(UserRightsContext)
  if (context === undefined) {
    throw new Error('useRights must be used within UserRightsProvider')
  }
  return context
}
