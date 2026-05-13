import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useRights } from '../hooks/useRights'
import { getAllUsers, activateUser, deactivateUser } from '../services/userService'

export default function UserManagementPage() {
  const { currentUser } = useContext(AuthContext)
  const { rights } = useRights()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (rights?.ADM_USER !== 1) {
      navigate('/products')
      return
    }
    loadUsers()
  }, [rights, navigate])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      if (user.record_status === 'ACTIVE') {
        await deactivateUser(user.userId)
      } else {
        await activateUser(user.userId)
      }
      await loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  if (rights?.ADM_USER !== 1) {
    return <div className="p-6 text-red-600">You do not have access to this page.</div>
  }

  if (loading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">User ID</th>
              <th className="border p-2 text-left">Username</th>
              <th className="border p-2 text-left">First Name</th>
              <th className="border p-2 text-left">Last Name</th>
              <th className="border p-2 text-left">User Type</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Stamp</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSuperAdmin = user.user_type === 'SUPERADMIN'
              const canModify = !isSuperAdmin

              return (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="border p-2">{user.userId}</td>
                  <td className="border p-2">{user.username}</td>
                  <td className="border p-2">{user.firstName}</td>
                  <td className="border p-2">{user.lastName}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.user_type === 'SUPERADMIN'
                          ? 'bg-red-100 text-red-800'
                          : user.user_type === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.user_type}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.record_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.record_status}
                    </span>
                  </td>
                  <td className="border p-2 text-xs">{user.stamp || '-'}</td>
                  <td className="border p-2">
                    {isSuperAdmin ? (
                      <span
                        className="text-sm text-gray-500 cursor-not-allowed"
                        title="SUPERADMIN accounts cannot be modified"
                      >
                        N/A
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={!canModify}
                        className={`px-2 py-1 text-sm rounded text-white ${
                          user.record_status === 'ACTIVE'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {user.record_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
