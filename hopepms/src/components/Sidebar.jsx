import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useRights } from '../hooks/useRights'

export default function Sidebar() {
  const { currentUser } = useContext(AuthContext)
  const { rights } = useRights()

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'
  const canSeeRep001 = rights?.REP_001 === 1
  const canSeeRep002 = rights?.REP_002 === 1
  const canSeeAdmUser = rights?.ADM_USER === 1

  return (
    <aside className="w-64 bg-gray-100 border-r p-4">
      <div className="space-y-4">
        <Link
          to="/products"
          className="block px-4 py-2 rounded text-gray-800 hover:bg-gray-200"
        >
          Products
        </Link>

        {isAdmin && (
          <Link
            to="/deleted-items"
            className="block px-4 py-2 rounded text-gray-800 hover:bg-gray-200"
          >
            Deleted Items
          </Link>
        )}

        {canSeeRep001 && (
          <Link
            to="/reports/product"
            className="block px-4 py-2 rounded text-gray-800 hover:bg-gray-200"
          >
            Product Report (REP_001)
          </Link>
        )}

        {canSeeRep002 && (
          <Link
            to="/reports/top-selling"
            className="block px-4 py-2 rounded text-gray-800 hover:bg-gray-200"
          >
            Top Selling (REP_002)
          </Link>
        )}

        {canSeeAdmUser && (
          <Link
            to="/admin/users"
            className="block px-4 py-2 rounded text-gray-800 hover:bg-gray-200"
          >
            Admin / Users
          </Link>
        )}
      </div>
    </aside>
  )
}
