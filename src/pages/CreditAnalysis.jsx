import React, { useState, useEffect } from 'react'
import { Search, SearchCheck, ArrowRight, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../api'
import FlowStatus from '../components/FlowStatus'

function CreditAnalysis() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [creditFormId, setCreditFormId] = useState(null)
  const [creditForm, setCreditForm] = useState({
    approved_amount: '', approved_amount_reserve: '', interest_rate: '', term_months: '', approval_notes: ''
  })

  const fetchData = () => {
    setLoading(true)
    api.getDealsByStep('credit_analysis', search).then(setDeals).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  const openCreditForm = (deal) => {
    setCreditFormId(deal.id)
    setCreditForm({
      approved_amount: deal.approved_amount || deal.amount || '',
      approved_amount_reserve: deal.approved_amount_reserve || '',
      interest_rate: deal.interest_rate || '',
      term_months: deal.term_months || deal.requested_term || '',
      approval_notes: deal.approval_notes || ''
    })
  }

  const handleSaveAndApprove = async (id) => {
    if (!creditForm.approved_amount) { alert('กรุณากำหนดวงเงินหลัก'); return }
    await api.updateDeal(id, {
      approved_amount: Number(creditForm.approved_amount) || 0,
      approved_amount_reserve: Number(creditForm.approved_amount_reserve) || 0,
      interest_rate: Number(creditForm.interest_rate) || 0,
      term_months: Number(creditForm.term_months) || 0,
      approval_notes: creditForm.approval_notes
    })
    await api.moveStep(id, 'approved')
    setCreditFormId(null)
    fetchData()
  }

  const handleReject = async (id) => {
    if (!confirm('ยืนยันปฏิเสธสินเชื่อ?')) return
    await api.updateDeal(id, { current_step: 'rejected' })
    fetchData()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2"><SearchCheck className="text-yellow-500" size={28} /> พิจารณาสินเชื่อ</h1>
        <p className="text-gray-500 mt-1">ทีมวิเคราะห์สินเชื่อ — กำหนดวงเงินหลัก + สำรอง แล้วส่งอนุมัติ</p>
      </div>
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500" />
      </div>

      <div className="mb-4">
        <a href="/api/export/deals?step=credit_analysis" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการรอพิจารณา</div>}
        {deals.map((deal) => {
          const isExpanded = expandedId === deal.id
          const isFormOpen = creditFormId === deal.id

          return (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm border border-yellow-100">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{deal.customer_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">{deal.product_type}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">วงเงินขอ: <strong className="text-lg text-green-700">฿ {(deal.amount || 0).toLocaleString()}</strong></p>
                    <div className="mt-2"><FlowStatus currentStep="credit_analysis" /></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openCreditForm(deal)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                      กำหนดวงเงิน & ส่งอนุมัติ
                    </button>
                    <button onClick={() => handleReject(deal.id)} className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm">
                      <XCircle size={14} /> ปฏิเสธ
                    </button>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {deal.purpose && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-500">วัตถุประสงค์</p><p className="font-medium text-gray-800">{deal.purpose}</p></div>}
                  {deal.monthly_revenue > 0 && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-500">รายได้/เดือน</p><p className="font-medium text-gray-800">฿ {deal.monthly_revenue?.toLocaleString()}</p></div>}
                  {deal.existing_debt > 0 && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-500">หนี้สินปัจจุบัน</p><p className="font-medium text-red-600">฿ {deal.existing_debt?.toLocaleString()}</p></div>}
                  {deal.collateral && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-500">หลักประกัน</p><p className="font-medium text-gray-800">{deal.collateral}</p></div>}
                </div>

                {/* Toggle Sale data */}
                <button onClick={() => setExpandedId(isExpanded ? null : deal.id)} className="flex items-center gap-1 text-sm text-yellow-700 mt-3 hover:text-yellow-900">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? 'ซ่อนรายละเอียด' : 'ดูข้อมูลจาก Sale ทั้งหมด'}
                </button>
              </div>

              {/* Credit Form - กำหนดวงเงิน */}
              {isFormOpen && (
                <div className="border-t p-5 bg-yellow-50">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-3">💰 กำหนดวงเงินและเงื่อนไข</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">วงเงินหลัก (฿) *</label>
                      <input type="number" value={creditForm.approved_amount} onChange={(e) => setCreditForm({ ...creditForm, approved_amount: e.target.value })} className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white" placeholder="วงเงินอนุมัติหลัก" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">วงเงินสำรอง (฿)</label>
                      <input type="number" value={creditForm.approved_amount_reserve} onChange={(e) => setCreditForm({ ...creditForm, approved_amount_reserve: e.target.value })} className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white" placeholder="วงเงินเพิ่มเติม (ถ้ามี)" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ย (%/ปี)</label>
                      <input type="number" step="0.1" value={creditForm.interest_rate} onChange={(e) => setCreditForm({ ...creditForm, interest_rate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ระยะเวลา (เดือน)</label>
                      <input type="number" value={creditForm.term_months} onChange={(e) => setCreditForm({ ...creditForm, term_months: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">เงื่อนไข / หมายเหตุ</label>
                      <input type="text" value={creditForm.approval_notes} onChange={(e) => setCreditForm({ ...creditForm, approval_notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white" placeholder="เช่น ต้องมีผู้ค้ำประกัน" />
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="mt-3 p-3 bg-white rounded-lg border text-sm">
                    <span className="text-gray-600">สรุป: วงเงินหลัก <strong className="text-green-700">฿ {Number(creditForm.approved_amount || 0).toLocaleString()}</strong></span>
                    {Number(creditForm.approved_amount_reserve) > 0 && (
                      <span className="text-gray-600"> + สำรอง <strong className="text-blue-600">฿ {Number(creditForm.approved_amount_reserve).toLocaleString()}</strong></span>
                    )}
                    <span className="text-gray-600"> = รวม <strong>฿ {(Number(creditForm.approved_amount || 0) + Number(creditForm.approved_amount_reserve || 0)).toLocaleString()}</strong></span>
                    {creditForm.interest_rate && <span className="text-gray-600"> | ดอกเบี้ย {creditForm.interest_rate}%</span>}
                    {creditForm.term_months && <span className="text-gray-600"> | {creditForm.term_months} เดือน</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleSaveAndApprove(deal.id)} className="flex items-center gap-1 bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 font-medium">
                      บันทึก & ส่งอนุมัติ <ArrowRight size={14} />
                    </button>
                    <button onClick={() => setCreditFormId(null)} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-300">ยกเลิก</button>
                  </div>
                </div>
              )}

              {/* Expanded: Full Sale Data */}
              {isExpanded && (
                <div className="border-t p-5 bg-yellow-50/30">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-4">📋 ข้อมูลจาก Sale</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">🏢 ข้อมูลบริษัท</h5>
                      <div className="space-y-1.5 text-sm">
                        <InfoRow label="ชื่อบริษัท" value={deal.company_name} />
                        <InfoRow label="เลขทะเบียน/ภาษี" value={deal.tax_id} />
                        <InfoRow label="ประเภทธุรกิจ" value={deal.business_type} />
                        <InfoRow label="ที่อยู่" value={deal.company_address} />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">👤 ผู้ติดต่อ</h5>
                      <div className="space-y-1.5 text-sm">
                        <InfoRow label="ชื่อ" value={deal.contact_person} />
                        <InfoRow label="โทร" value={deal.contact_phone || deal.phone} />
                        <InfoRow label="อีเมล" value={deal.contact_email} />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">💰 รายละเอียดสินเชื่อ</h5>
                      <div className="space-y-1.5 text-sm">
                        <InfoRow label="วงเงินที่ขอ" value={deal.amount ? `฿ ${deal.amount.toLocaleString()}` : null} />
                        <InfoRow label="วัตถุประสงค์" value={deal.purpose} />
                        <InfoRow label="ดอกเบี้ยที่ต้องการ" value={deal.requested_rate ? `${deal.requested_rate}%` : null} />
                        <InfoRow label="ระยะที่ต้องการ" value={deal.requested_term ? `${deal.requested_term} เดือน` : null} />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">📋 โครงการ</h5>
                      <div className="space-y-1.5 text-sm">
                        <InfoRow label="ชื่อโครงการ" value={deal.project_name} />
                        <InfoRow label="มูลค่า" value={deal.project_value ? `฿ ${deal.project_value.toLocaleString()}` : null} />
                        <InfoRow label="หน่วยงาน/ผู้ซื้อ" value={deal.government_agency} />
                        <InfoRow label="เลขที่บิล" value={deal.bill_no} />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">📊 การเงิน</h5>
                      <div className="space-y-1.5 text-sm">
                        <InfoRow label="รายได้/เดือน" value={deal.monthly_revenue ? `฿ ${deal.monthly_revenue.toLocaleString()}` : null} />
                        <InfoRow label="หนี้สิน" value={deal.existing_debt ? `฿ ${deal.existing_debt.toLocaleString()}` : null} highlight={deal.existing_debt > 0 ? 'red' : null} />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">🏠 หลักประกัน</h5>
                      <div className="space-y-1.5 text-sm">
                        <InfoRow label="ประเภท" value={deal.collateral} />
                        <InfoRow label="มูลค่า" value={deal.collateral_value ? `฿ ${deal.collateral_value.toLocaleString()}` : null} />
                      </div>
                    </div>
                  </div>
                  {deal.documents_submitted && (
                    <div className="mt-4">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">📎 เอกสาร</h5>
                      <pre className="text-sm text-gray-700 bg-white rounded-lg p-3 border whitespace-pre-wrap">{deal.documents_submitted}</pre>
                    </div>
                  )}
                  {(deal.sale_notes || deal.notes) && (
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">📝 หมายเหตุเซลล์</h5>
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">{deal.sale_notes || deal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  if (!value) return <div className="flex justify-between"><span className="text-gray-500">{label}</span><span className="text-gray-300">-</span></div>
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight === 'red' ? 'text-red-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}

export default CreditAnalysis
