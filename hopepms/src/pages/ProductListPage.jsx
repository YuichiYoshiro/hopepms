import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useRights } from '../hooks/useRights'
import {
  getProductsWithPrice,
  addProduct,
  updateProduct,
  softDeleteProduct,
} from '../services/productService'
import AddProductModal from '../components/AddProductModal'
import EditProductModal from '../components/EditProductModal'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'

export default function ProductListPage() {
  const { currentUser } = useContext(AuthContext)
  const { rights } = useRights()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProductsWithPrice()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (formData) => {
    try {
      await addProduct(formData)
      setShowAddModal(false)
      await loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateProduct = async (formData) => {
    try {
      await updateProduct(formData)
      setEditingProduct(null)
      await loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteProduct = async () => {
    try {
      await softDeleteProduct(deletingProduct.prodCode)
      setDeletingProduct(null)
      await loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const canAdd = rights?.PRD_ADD === 1
  const canEdit = rights?.PRD_EDIT === 1
  const canDelete = rights?.PRD_DEL === 1
  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  if (loading) {
    return <div className="p-6">Loading products...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        {canAdd && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Product
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Product Code</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Unit</th>
              <th className="border p-2 text-left">Unit Price</th>
              {isAdmin && <th className="border p-2 text-left">Stamp</th>}
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.prodCode} className="hover:bg-gray-50">
                <td className="border p-2">{product.prodCode}</td>
                <td className="border p-2">{product.description}</td>
                <td className="border p-2">{product.unit}</td>
                <td className="border p-2">
                  {product.unitPrice ? `$${product.unitPrice.toFixed(2)}` : 'N/A'}
                </td>
                {isAdmin && <td className="border p-2 text-xs">{product.stamp || '-'}</td>}
                <td className="border p-2 space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeletingProduct(product)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddProductModal
          onSave={handleAddProduct}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmDialog
          product={deletingProduct}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </div>
  )
}
