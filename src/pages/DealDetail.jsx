import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, FileText, Banknote, Calendar, ClipboardList, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { api } from '../api'

const STEPS = [
  { key: 'telesale', label: 'Telesale' },
  { key: 'sale', label: 'Sale' },
  { key: 'credit_analysis', label: 'พิจารณาสินเชื่อ' },
  { key: 'approved', label: 'อนุมัติ' },
  { key: 'contract', label: 'ทำสัญญา' },
  { key: 'disbursed', label: 'เบิกจ่าย' },
  { key: 'collection', label: 'ติดตามหนี้' },
  { key: 'accounting', label: 'บัญชี' },
  { key: 'closed', label: 'ปิดรายการ' },
]

function DealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDeal(id)
      .then(setDeal)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">กำลังโหลด...</p></div>
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ไม่พบรายการ</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">← กลับ</button>
      </div>
    )
  }

  const currentStepIdx = STEPS.findIndex(s => s.key === deal.current_step)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{deal.customer_name}</h1>
          <p className="text-sm text-gray-500">Deal #{deal.id} • {deal.product_type}</p>
        </div>
      </div>

      {/* Flow Progress */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">สถานะ Flow</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.filter(s => s.key !== 'closed').map((step, idx) => {
            const isDone = idx < currentStepIdx
            const isCurrent = idx === currentStepIdx
            return (
              <React.Fragment key={step.key}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  isDone ? 'bg-green-100 text-green-700' :
                  isCurrent ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  <span>{step.label}</span>
                </div>
                {idx < STEPS.length - 2 && (
                  <ArrowRight size={12} className={isDone ? 'text-green-400' : 'text-gray-300'} />
                )}
              </React.Fragment>
            )
          })}
        </div>
        {deal.current_step === 'closed' && (
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-green-600 text-white text-xs font-medium">
            ✅ ปิดรายการแล้ว
          </div>
        )}
        {deal.current_step === 'rejected' && (
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium">
            ❌ ถูกปฏิเสธ
          </div>
        )}
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ข้อมูลลูกค้า */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2"><User size={16} /> ข้อมูลลูกค้า</h3>
          <div className="space-y-3">
            <InfoRow label="ชื่อลูกค้า" value={deal.customer_name} />
            <InfoRow label="เบอร์โทร" value={deal.phone || '-'} />
            <InfoRow label="ระดับความสนใจ" value={deal.interest_level || '-'} />
          </div>
        </div>

        {/* ข้อมูลสินเชื่อ */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2"><Banknote size={16} /> ข้อมูลสินเชื่อ</h3>
          <div className="space-y-3">
            <InfoRow label="ผลิตภัณฑ์" value={deal.product_type} />
            <InfoRow label="วงเงินขอ" value={deal.amount > 0 ? `฿ ${deal.amount.toLocaleString()}` : '-'} />
            <InfoRow label="วงเงินอนุมัติ" value={deal.approved_amount > 0 ? `฿ ${deal.approved_amount.toLocaleString()}` : '-'} highlight />
            <InfoRow label="อัตราดอกเบี้ย" value={deal.interest_rate > 0 ? `${deal.interest_rate}% ต่อปี` : '-'} />
            <InfoRow label="ระยะเวลา" value={deal.term_months > 0 ? `${deal.term_months} เดือน` : '-'} />
          </div>
        </div>

        {/* สถานะการดำเนินงาน */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2"><Calendar size={16} /> Timeline</h3>
          <div className="space-y-3">
            <InfoRow label="วันที่สร้าง" value={formatDate(deal.created_at)} />
            <InfoRow label="อัพเดทล่าสุด" value={formatDate(deal.updated_at)} />
            <InfoRow label="ลงนามสัญญา" value={deal.contract_signed ? '✅ เรียบร้อย' : '⏳ ยังไม่ลงนาม'} />
            <InfoRow label="วันเบิกจ่าย" value={deal.disbursed_at || '-'} />
            <InfoRow label="วันชำระ" value={deal.paid_at || '-'} />
            <InfoRow label="วันปิดรายการ" value={deal.closed_at || '-'} />
          </div>
        </div>

        {/* หมายเหตุ */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2"><ClipboardList size={16} /> หมายเหตุ</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">หมายเหตุทั่วไป</p>
              <p className="text-sm text-gray-800 mt-1">{deal.notes || '-'}</p>
            </div>
            {deal.approval_notes && (
              <div>
                <p className="text-xs text-gray-500">เงื่อนไขอนุมัติ</p>
                <p className="text-sm text-gray-800 mt-1">{deal.approval_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-green-700' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dateStr.split('T')[0] || dateStr.split(' ')[0] || dateStr
}

export default DealDetail
