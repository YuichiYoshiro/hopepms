import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useRights } from '../hooks/useRights'

export default function Navbar() {
  const { currentUser, signOut } = useContext(AuthContext)
  const { rights } = useRights()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/products" className="text-xl font-semibold">
          HopePMS
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-sm">{currentUser?.username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
