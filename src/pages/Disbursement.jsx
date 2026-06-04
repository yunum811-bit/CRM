import React, { useState, useEffect } from 'react'
import { Search, Banknote, ArrowRight, Calculator } from 'lucide-react'
import { api } from '../api'
import FlowStatus from '../components/FlowStatus'

function Disbursement() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [calculatingId, setCalculatingId] = useState(null)
  const [calcForm, setCalcForm] = useState({ interest_rate: '', term_months: '', custom_deduction: '' })

  const fetchData = () => {
    setLoading(true)
    api.getDealsByStep('disbursed', search).then(setDeals).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  // คำนวณดอกเบี้ยหักล่วงหน้า
  const calculateInterest = (principal, rate, months) => {
    if (!principal || !rate || !months) return 0
    // ดอกเบี้ยแบบ flat: เงินต้น × อัตรา% × จำนวนเดือน / 12
    return Math.round(principal * (rate / 100) * (months / 12))
  }

  const handleOpenCalc = (deal) => {
    setCalculatingId(deal.id)
    setCalcForm({
      interest_rate: deal.interest_rate || '',
      term_months: deal.term_months || '',
      custom_deduction: ''
    })
  }

  const handleDisburse = async (deal) => {
    const principal = deal.approved_amount || deal.amount
    const rate = Number(calcForm.interest_rate) || deal.interest_rate
    const months = Number(calcForm.term_months) || deal.term_months

    // คำนวณดอกเบี้ยที่หัก
    let interestDeducted = Number(calcForm.custom_deduction)
    if (!interestDeducted) {
      interestDeducted = calculateInterest(principal, rate, months)
    }

    const netDisbursement = principal - interestDeducted

    if (!confirm(`ยืนยันเบิกจ่าย:\n\nวงเงินอนุมัติ: ฿${principal.toLocaleString()}\nดอกเบี้ยหักล่วงหน้า: ฿${interestDeducted.toLocaleString()}\nยอดจ่ายจริง: ฿${netDisbursement.toLocaleString()}`)) return

    await api.updateDeal(deal.id, {
      interest_rate: rate,
      term_months: months,
      interest_deducted: interestDeducted,
      net_disbursement: netDisbursement,
      disbursed_at: new Date().toISOString().split('T')[0]
    })
    await api.moveStep(deal.id, 'collection')
    setCalculatingId(null)
    fetchData()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Banknote className="text-orange-500" size={28} /> เบิกจ่าย
        </h1>
        <p className="text-gray-500 mt-1">ดำเนินการเบิกจ่ายเงินให้ลูกค้า (หักดอกเบี้ยล่วงหน้า)</p>
      </div>

      {/* คำอธิบายการคิดดอกเบี้ย */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-orange-800 font-medium mb-1">📌 วิธีคิดดอกเบี้ย (หักล่วงหน้า)</p>
        <p className="text-xs text-orange-700">ดอกเบี้ย = วงเงินอนุมัติ × อัตราดอกเบี้ย(%) × ระยะเวลา(เดือน) ÷ 12</p>
        <p className="text-xs text-orange-700">ยอดจ่ายจริง = วงเงินอนุมัติ − ดอกเบี้ยหักล่วงหน้า</p>
      </div>

      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
      </div>

      <div className="mb-4">
        <a href="/api/export/deals?step=disbursed" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการรอเบิกจ่าย</div>}
        {deals.map((deal) => {
          const principal = deal.approved_amount || deal.amount
          const isCalcing = calculatingId === deal.id
          const previewRate = isCalcing ? (Number(calcForm.interest_rate) || deal.interest_rate) : deal.interest_rate
          const previewMonths = isCalcing ? (Number(calcForm.term_months) || deal.term_months) : deal.term_months
          const previewInterest = isCalcing && calcForm.custom_deduction
            ? Number(calcForm.custom_deduction)
            : calculateInterest(principal, previewRate, previewMonths)
          const previewNet = principal - previewInterest

          return (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{deal.customer_name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{deal.product_type}</span>
                  </div>

                  {/* ข้อมูลการเงิน */}
                  <div className="mt-3 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">วงเงินอนุมัติ</p>
                        <p className="font-bold text-gray-900">฿ {principal?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">ดอกเบี้ย/ปี</p>
                        <p className="font-semibold text-gray-800">{previewRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">ระยะเวลา</p>
                        <p className="font-semibold text-gray-800">{previewMonths} เดือน</p>
                      </div>
                      <div>
                        <p className="text-red-500 text-xs font-medium">ดอกเบี้ยหักล่วงหน้า</p>
                        <p className="font-bold text-red-600">฿ {previewInterest.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-sm text-gray-600">ยอดจ่ายจริงให้ลูกค้า:</span>
                      <span className="text-xl font-bold text-green-600">฿ {previewNet.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Form แก้ไข */}
                  {isCalcing && (
                    <div className="mt-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-1">
                        <Calculator size={14} /> ปรับเงื่อนไขดอกเบี้ย
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ย (%/ปี)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={calcForm.interest_rate}
                            onChange={(e) => setCalcForm({ ...calcForm, interest_rate: e.target.value })}
                            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ระยะเวลา (เดือน)</label>
                          <input
                            type="number"
                            value={calcForm.term_months}
                            onChange={(e) => setCalcForm({ ...calcForm, term_months: e.target.value })}
                            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">กำหนดยอดหักเอง (฿)</label>
                          <input
                            type="number"
                            value={calcForm.custom_deduction}
                            onChange={(e) => setCalcForm({ ...calcForm, custom_deduction: e.target.value })}
                            placeholder="ถ้าว่างจะคำนวณอัตโนมัติ"
                            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleDisburse(deal)}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          ✓ ยืนยันเบิกจ่าย (หักดอกเบี้ยแล้ว) <ArrowRight size={14} />
                        </button>
                        <button
                          onClick={() => setCalculatingId(null)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3"><FlowStatus currentStep="disbursed" /></div>
                </div>

                {!isCalcing && (
                  <button
                    onClick={() => handleOpenCalc(deal)}
                    className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 text-sm whitespace-nowrap"
                  >
                    <Calculator size={14} /> คำนวณ & เบิกจ่าย
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Disbursement
