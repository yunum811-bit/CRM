import React, { useState, useEffect } from 'react'
import { Search, FileSignature, ArrowRight } from 'lucide-react'
import { api } from '../api'
import DealCard from '../components/DealCard'

function Contract() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = () => { setLoading(true); api.getDealsByStep('contract', search).then(setDeals).catch(console.error).finally(() => setLoading(false)) }
  useEffect(() => { fetchData() }, [search])

  const handleMoveNext = async (id) => { await api.updateDeal(id, { contract_signed: 1 }); await api.moveStep(id, 'disbursed'); fetchData() }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileSignature className="text-purple-500" size={28} /> นิติกรรมสัญญา</h1>
        <p className="text-gray-500 mt-1">ฝ่ายนิติกรรม — จัดทำสัญญา ตรวจสอบเอกสาร ลงนาม</p>
      </div>
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>
      <div className="mb-4">
        <a href="/api/export/deals?step=contract" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>
      <div className="space-y-3">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการรอจัดทำสัญญา</div>}
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} step="contract" actions={
            <button onClick={() => handleMoveNext(deal.id)} className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 text-sm whitespace-nowrap">ลงนามแล้ว → เบิกจ่าย <ArrowRight size={14} /></button>
          }>
            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
              <p className="text-gray-600">อนุมัติ: <strong>฿ {(deal.approved_amount || deal.amount)?.toLocaleString()}</strong></p>
              {deal.interest_rate > 0 && <p className="text-gray-600">ดอกเบี้ย: {deal.interest_rate}%</p>}
              {deal.term_months > 0 && <p className="text-gray-600">ระยะ: {deal.term_months} เดือน</p>}
            </div>
          </DealCard>
        ))}
      </div>
    </div>
  )
}

export default Contract
