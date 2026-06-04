import React, { useState, useEffect } from 'react'
import { Search, ThumbsUp, ArrowRight, XCircle } from 'lucide-react'
import { api } from '../api'
import FlowStatus from '../components/FlowStatus'

function Approval() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = () => { setLoading(true); api.getDealsByStep('approved', search).then(setDeals).catch(console.error).finally(() => setLoading(false)) }
  useEffect(() => { fetchData() }, [search])

  const handleMoveNext = async (id) => {
    if (!confirm('ยืนยันอนุมัติ → ส่งนิติกรรมสัญญา?')) return
    await api.moveStep(id, 'contract')
    fetchData()
  }

  const handleReject = async (id) => {
    if (!confirm('ยืนยันไม่อนุมัติ?')) return
    await api.updateDeal(id, { current_step: 'rejected' })
    fetchData()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2"><ThumbsUp className="text-green-500" size={28} /> อนุมัติ</h1>
        <p className="text-gray-500 mt-1">ตรวจสอบวงเงินที่ฝ่ายพิจารณากำหนด แล้วอนุมัติหรือปฏิเสธ</p>
      </div>
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="mb-4">
        <a href="/api/export/deals?step=approved" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการรออนุมัติ</div>}
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl shadow-sm border">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800">{deal.customer_name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{deal.product_type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">วงเงินขอ: ฿ {deal.amount?.toLocaleString()}</p>

                  {/* วงเงินที่ฝ่ายพิจารณากำหนด */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-green-800 mb-2">ฝ่ายพิจารณาสินเชื่อกำหนด:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">วงเงินหลัก</p>
                        <p className="font-bold text-green-700 text-lg">฿ {(deal.approved_amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">วงเงินสำรอง</p>
                        <p className="font-bold text-blue-600 text-lg">฿ {(deal.approved_amount_reserve || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ดอกเบี้ย</p>
                        <p className="font-semibold">{deal.interest_rate || 0}% /ปี</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ระยะเวลา</p>
                        <p className="font-semibold">{deal.term_months || 0} เดือน</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                      วงเงินรวม: <strong>฿ {((deal.approved_amount || 0) + (deal.approved_amount_reserve || 0)).toLocaleString()}</strong>
                    </p>
                    {deal.approval_notes && <p className="text-sm text-gray-500 mt-1">เงื่อนไข: {deal.approval_notes}</p>}
                  </div>

                  <div className="mt-3"><FlowStatus currentStep="approved" /></div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleMoveNext(deal.id)} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                    อนุมัติ → นิติกรรม <ArrowRight size={14} />
                  </button>
                  <button onClick={() => handleReject(deal.id)} className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
                    <XCircle size={14} /> ไม่อนุมัติ
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Approval
