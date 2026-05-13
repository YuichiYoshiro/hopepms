export default function DeleteConfirmDialog({ product, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Delete Product</h2>
        <p className="mb-4">
          Are you sure you want to delete{' '}
          <strong>
            {product.prodCode} - {product.description}
          </strong>
          ?
        </p>
        <p className="mb-4 text-sm text-gray-600">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
