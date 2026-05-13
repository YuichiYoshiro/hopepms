import { useEffect, useState } from 'react'
import { useRights } from '../hooks/useRights'
import { getProductReport } from '../services/reportService'

export default function ProductReportPage() {
  const { rights } = useRights()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (rights?.REP_001 !== 1) {
      return
    }
    loadReport()
  }, [rights])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await getProductReport()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (rights?.REP_001 !== 1) {
    return <div className="p-6 text-red-600">You do not have access to this report.</div>
  }

  if (loading) {
    return <div className="p-6">Loading report...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Product Report (REP_001)</h1>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Product Code</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Unit</th>
              <th className="border p-2 text-left">Unit Price</th>
              <th className="border p-2 text-left">Effective Date</th>
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
                <td className="border p-2">{product.effDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
