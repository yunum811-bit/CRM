import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PhoneCall, UserCheck, SearchCheck, ThumbsUp, FileSignature, Banknote, Clock, Gavel, Calculator, ArrowRight, Search } from 'lucide-react'
import { api } from '../api'

const flowSteps = [
  { path: '/telesale', label: 'Telesale', icon: PhoneCall, color: 'bg-brand-500', key: 'telesale' },
  { path: '/sale', label: 'Sale', icon: UserCheck, color: 'bg-brand-600', key: 'sale' },
  { path: '/credit-analysis', label: 'พิจารณาสินเชื่อ', icon: SearchCheck, color: 'bg-accent-500', key: 'credit_analysis' },
  { path: '/approval', label: 'อนุมัติ', icon: ThumbsUp, color: 'bg-green-600', key: 'approved' },
  { path: '/contract', label: 'นิติกรรมสัญญา', icon: FileSignature, color: 'bg-brand-700', key: 'contract' },
  { path: '/disbursement', label: 'เบิกจ่าย', icon: Banknote, color: 'bg-accent-600', key: 'disbursed' },
  { path: '/collection', label: 'ติดตามหนี้', icon: Clock, color: 'bg-red-500', key: 'collection' },
  { path: '/legal', label: 'กฎหมาย', icon: Gavel, color: 'bg-purple-600', key: 'legal' },
  { path: '/accounting', label: 'บัญชี', icon: Calculator, color: 'bg-brand-800', key: 'accounting' },
]

function Dashboard() {
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [globalSearch, setGlobalSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    api.getDashboard()
      .then(setDashData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleGlobalSearch = async (term) => {
    setGlobalSearch(term)
    if (!term || term.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const results = await api.getDealsByStep('', term)
      setSearchResults(results)
    } catch (err) { console.error(err) }
    setSearching(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">กำลังโหลด...</p></div>
  }

  const stepCounts = dashData?.stepCounts || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 mb-1">แดชบอร์ด</h1>
          <p className="text-brand-500">ภาพรวม Flow การทำงานทั้งหมด</p>
        </div>
        {/* Export Buttons */}
        <div className="flex gap-2">
          <a href="/api/export/deals" download className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm">
            📥 Export Deals
          </a>
          <a href="/api/export/customers" download className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
            📥 ลูกค้า
          </a>
        </div>
      </div>

      {/* Global Search */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-brand-100 p-4 mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            placeholder="🔍 ค้นหาทั้งระบบ — ชื่อลูกค้า, ประเภทสินเชื่อ..."
            className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
          />
        </div>
        {searching && <p className="text-sm text-gray-400 mt-2 pl-2">กำลังค้นหา...</p>}
        {searchResults.length > 0 && (
          <div className="mt-3 max-h-80 overflow-y-auto divide-y rounded-lg border">
            {searchResults.map((deal) => (
              <div key={deal.id} className="px-4 py-3 hover:bg-green-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{deal.customer_name}</p>
                  <p className="text-xs text-gray-500">{deal.product_type} | วงเงิน: ฿{(deal.amount || 0).toLocaleString()} {deal.phone ? `| ${deal.phone}` : ''}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap">{deal.current_step_label}</span>
              </div>
            ))}
          </div>
        )}
        {globalSearch.length >= 2 && !searching && searchResults.length === 0 && (
          <p className="text-sm text-gray-400 mt-2 pl-2">ไม่พบผลลัพธ์</p>
        )}
      </div>

      {/* Flow Pipeline */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-brand-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-brand-800 mb-4">Pipeline สินเชื่อ</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {flowSteps.map((step, idx) => {
            const Icon = step.icon
            const count = stepCounts[step.key] || 0
            return (
              <React.Fragment key={step.key}>
                <Link to={step.path} className="flex-shrink-0 group">
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-brand-50 transition-all min-w-[100px]">
                    <div className={`${step.color} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">{step.label}</span>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                </Link>
                {idx < flowSteps.length - 1 && (
                  <ArrowRight size={20} className="text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Recent activities */}
      {dashData?.recentDeals && dashData.recentDeals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">รายการล่าสุด</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ลูกค้า</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ประเภท</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">วงเงิน (฿)</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">ขั้นตอน</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashData.recentDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{deal.customer_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{deal.product_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{deal.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {deal.current_step_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{deal.created_at?.split('T')[0] || deal.created_at?.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
