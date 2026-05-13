import { useState } from 'react'

export default function AddProductModal({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    prodCode: '',
    description: '',
    unit: 'pc',
    unitPrice: '',
  })
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.prodCode || !formData.description) {
      setError('Product code and description are required')
      return
    }

    try {
      await onSave({
        ...formData,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Add Product</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Code</label>
            <input
              type="text"
              name="prodCode"
              value={formData.prodCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
              maxLength="6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
              maxLength="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="pc">pc</option>
              <option value="ea">ea</option>
              <option value="mtr">mtr</option>
              <option value="pkg">pkg</option>
              <option value="ltr">ltr</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price (optional)</label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
