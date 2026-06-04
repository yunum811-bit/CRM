import React, { useState, useEffect } from 'react'
import { Search, UserCheck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../api'
import FlowStatus from '../components/FlowStatus'

function Sale() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const fetchData = () => {
    setLoading(true)
    api.getDealsByStep('sale', search).then(setDeals).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  const openForm = (deal) => {
    setEditingId(deal.id)
    setEditForm({
      product_type: deal.product_type || 'Factoring',
      amount: deal.amount || '',
      company_name: deal.company_name || deal.customer_name || '',
      company_address: deal.company_address || '',
      tax_id: deal.tax_id || '',
      business_type: deal.business_type || '',
      contact_person: deal.contact_person || '',
      contact_phone: deal.contact_phone || deal.phone || '',
      contact_email: deal.contact_email || '',
      purpose: deal.purpose || '',
      collateral: deal.collateral || '',
      collateral_value: deal.collateral_value || '',
      monthly_revenue: deal.monthly_revenue || '',
      existing_debt: deal.existing_debt || '',
      project_name: deal.project_name || '',
      project_value: deal.project_value || '',
      government_agency: deal.government_agency || '',
      bill_no: deal.bill_no || '',
      requested_rate: deal.requested_rate || '',
      requested_term: deal.requested_term || '',
      documents_submitted: deal.documents_submitted || '',
      sale_notes: deal.sale_notes || '',
      visited_at: deal.visited_at || new Date().toISOString().split('T')[0],
      notes: deal.notes || '',
    })
  }

  const handleUpdate = async (id) => {
    const payload = {
      ...editForm,
      amount: Number(editForm.amount) || 0,
      collateral_value: Number(editForm.collateral_value) || 0,
      monthly_revenue: Number(editForm.monthly_revenue) || 0,
      existing_debt: Number(editForm.existing_debt) || 0,
      project_value: Number(editForm.project_value) || 0,
      requested_rate: Number(editForm.requested_rate) || 0,
      requested_term: Number(editForm.requested_term) || 0,
    }
    await api.updateDeal(id, payload)
    setEditingId(null)
    fetchData()
  }

  const handleMoveNext = async (id) => {
    await api.moveStep(id, 'credit_analysis')
    fetchData()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserCheck className="text-blue-500" size={28} /> Sale (เซลล์)
        </h1>
        <p className="text-gray-500 mt-1">เซลล์เข้าพบลูกค้า เก็บข้อมูลครบถ้วนก่อนส่งพิจารณาสินเชื่อ</p>
      </div>

      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="mb-4">
        <a href="/api/export/deals?step=sale" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการจากขั้นตอน Telesale</div>}
        {deals.map((deal) => {
          const isEditing = editingId === deal.id

          return (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm border">
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">{deal.customer_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{deal.product_type}</span>
                    </div>
                    {deal.phone && <p className="text-sm text-gray-500">📞 {deal.phone}</p>}
                    {deal.amount > 0 && !isEditing && <p className="text-sm text-gray-700 mt-1">วงเงิน: <strong>฿ {deal.amount?.toLocaleString()}</strong></p>}
                    {deal.notes && !isEditing && <p className="text-sm text-gray-400 mt-1">{deal.notes}</p>}
                    <div className="mt-2"><FlowStatus currentStep="sale" /></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => isEditing ? setEditingId(null) : openForm(deal)}
                      className="flex items-center gap-1 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                    >
                      {isEditing ? <><ChevronUp size={14} /> ปิด</> : <><ChevronDown size={14} /> กรอกข้อมูล</>}
                    </button>
                    <button
                      onClick={() => handleMoveNext(deal.id)}
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 text-sm"
                    >
                      ส่งพิจารณา <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="border-t p-5 bg-blue-50/50">
                  {/* Section 1: ข้อมูลบริษัท */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">🏢 ข้อมูลบริษัท / ผู้กู้</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อบริษัท / ห้าง</label>
                        <input type="text" value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">เลขทะเบียนนิติบุคคล / ภาษี</label>
                        <input type="text" value={editForm.tax_id} onChange={(e) => setEditForm({ ...editForm, tax_id: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ประเภทธุรกิจ</label>
                        <input type="text" value={editForm.business_type} onChange={(e) => setEditForm({ ...editForm, business_type: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder="เช่น ก่อสร้าง, IT, ค้าส่ง" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่บริษัท</label>
                        <input type="text" value={editForm.company_address} onChange={(e) => setEditForm({ ...editForm, company_address: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: ผู้ติดต่อ */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">👤 ผู้ติดต่อ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อผู้ติดต่อ</label>
                        <input type="text" value={editForm.contact_person} onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทร</label>
                        <input type="tel" value={editForm.contact_phone} onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">อีเมล</label>
                        <input type="email" value={editForm.contact_email} onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: รายละเอียดสินเชื่อ */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">💰 รายละเอียดสินเชื่อ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ผลิตภัณฑ์</label>
                        <select value={editForm.product_type} onChange={(e) => setEditForm({ ...editForm, product_type: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500">
                          <option>Factoring</option>
                          <option>ขายบิล</option>
                          <option>Trade</option>
                          <option>Loan</option>
                          <option>อื่นๆ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">วงเงินที่ต้องการ (฿)</label>
                        <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">วัตถุประสงค์</label>
                        <input type="text" value={editForm.purpose} onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder="เช่น เงินทุนหมุนเวียน, ซื้อวัตถุดิบ" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ยที่ต้องการ (%/ปี)</label>
                        <input type="number" step="0.1" value={editForm.requested_rate} onChange={(e) => setEditForm({ ...editForm, requested_rate: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ระยะเวลาที่ต้องการ (เดือน)</label>
                        <input type="number" value={editForm.requested_term} onChange={(e) => setEditForm({ ...editForm, requested_term: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: โครงการ (สำหรับ Factoring) */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">📋 โครงการ / บิล (สำหรับ Factoring / ขายบิล)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อโครงการ</label>
                        <input type="text" value={editForm.project_name} onChange={(e) => setEditForm({ ...editForm, project_name: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่าโครงการ/บิล (฿)</label>
                        <input type="number" value={editForm.project_value} onChange={(e) => setEditForm({ ...editForm, project_value: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หน่วยงานราชการ / ผู้ซื้อ</label>
                        <input type="text" value={editForm.government_agency} onChange={(e) => setEditForm({ ...editForm, government_agency: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder="เช่น กรมทางหลวง" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่บิล / สัญญา</label>
                        <input type="text" value={editForm.bill_no} onChange={(e) => setEditForm({ ...editForm, bill_no: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: ข้อมูลทางการเงิน */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">📊 ข้อมูลทางการเงิน</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">รายได้ต่อเดือน (฿)</label>
                        <input type="number" value={editForm.monthly_revenue} onChange={(e) => setEditForm({ ...editForm, monthly_revenue: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หนี้สินปัจจุบัน (฿)</label>
                        <input type="number" value={editForm.existing_debt} onChange={(e) => setEditForm({ ...editForm, existing_debt: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Section 6: หลักประกัน */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">🏠 หลักประกัน</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ประเภทหลักประกัน</label>
                        <input type="text" value={editForm.collateral} onChange={(e) => setEditForm({ ...editForm, collateral: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder="เช่น โฉนดที่ดิน, เครื่องจักร, บิลรับเงิน" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่าหลักประกัน (฿)</label>
                        <input type="number" value={editForm.collateral_value} onChange={(e) => setEditForm({ ...editForm, collateral_value: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Section 7: เอกสาร + หมายเหตุ */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">📎 เอกสาร & หมายเหตุ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">เอกสารที่ลูกค้าส่งมอบ</label>
                        <textarea rows="3" value={editForm.documents_submitted} onChange={(e) => setEditForm({ ...editForm, documents_submitted: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder="เช่น&#10;- สำเนาบัตรประชาชน&#10;- หนังสือรับรองบริษัท&#10;- งบการเงินย้อนหลัง 3 ปี&#10;- สำเนาสัญญา"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หมายเหตุเซลล์</label>
                        <textarea rows="3" value={editForm.sale_notes} onChange={(e) => setEditForm({ ...editForm, sale_notes: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder="บันทึกข้อสังเกต ความเห็นเซลล์"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เข้าพบ</label>
                        <input type="date" value={editForm.visited_at} onChange={(e) => setEditForm({ ...editForm, visited_at: e.target.value })} className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={() => handleUpdate(deal.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">บันทึกข้อมูล</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 text-sm">ยกเลิก</button>
                    <button onClick={() => { handleUpdate(deal.id).then(() => handleMoveNext(deal.id)) }} className="ml-auto flex items-center gap-1 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium">
                      บันทึก & ส่งพิจารณา <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Sale
