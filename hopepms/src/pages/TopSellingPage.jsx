import { useEffect, useState } from 'react'
import { useRights } from '../hooks/useRights'
import { getTopSelling } from '../services/reportService'

export default function TopSellingPage() {
  const { rights } = useRights()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (rights?.REP_002 !== 1) {
      return
    }
    loadReport()
  }, [rights])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await getTopSelling()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (rights?.REP_002 !== 1) {
    return <div className="p-6 text-red-600">You do not have access to this report.</div>
  }

  if (loading) {
    return <div className="p-6">Loading report...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Top Selling Products (REP_002)</h1>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Product Code</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-right">Total Qty</th>
              <th className="border p-2 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">{product.prodCode}</td>
                <td className="border p-2">{product.description}</td>
                <td className="border p-2 text-right">{product.totalQty || 0}</td>
                <td className="border p-2 text-right">
                  ${product.totalRevenue ? product.totalRevenue.toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
