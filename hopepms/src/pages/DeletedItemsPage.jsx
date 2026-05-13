import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { getInactiveProducts, recoverProduct } from '../services/productService'

export default function DeletedItemsPage() {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [deletedProducts, setDeletedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only ADMIN/SUPERADMIN can access this page
    if (currentUser?.user_type !== 'ADMIN' && currentUser?.user_type !== 'SUPERADMIN') {
      navigate('/products')
      return
    }
    loadDeletedProducts()
  }, [currentUser, navigate])

  const loadDeletedProducts = async () => {
    try {
      setLoading(true)
      const data = await getInactiveProducts()
      setDeletedProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecover = async (prodCode) => {
    try {
      await recoverProduct(prodCode)
      await loadDeletedProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="p-6">Loading deleted items...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Deleted Items</h1>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      {deletedProducts.length === 0 ? (
        <p className="text-gray-600">No deleted items.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 text-left">Product Code</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Stamp</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedProducts.map((product) => (
                <tr key={product.prodCode} className="hover:bg-gray-50">
                  <td className="border p-2">{product.prodCode}</td>
                  <td className="border p-2">{product.description}</td>
                  <td className="border p-2 text-xs">{product.stamp || '-'}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleRecover(product.prodCode)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Recover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
