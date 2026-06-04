import React, { useState, useEffect } from 'react'
import { Search, Gavel, Plus, Trash2, Edit, X, ArrowRight, CheckCircle2, Ban } from 'lucide-react'
import { api } from '../api'

function Legal() {
  const [deals, setDeals] = useState([]) // deals ที่อยู่ใน collection หรือ legal step
  const [legalActions, setLegalActions] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedDealId, setSelectedDealId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    deal_id: '', action_type: 'หนังสือทวงถาม', action_date: '', lawyer_name: '', court_name: '', case_number: '', description: '', cost: '', status: 'ดำเนินการ', next_date: '', notes: ''
  })

  const fetchDeals = async () => {
    setLoading(true)
    try {
      // ดึง deals ที่อยู่ขั้นตอน legal
      const legalDeals = await api.getDealsByStep('legal', search)
      // ดึง deals ที่อยู่ขั้นตอน collection ด้วย (เผื่อจะย้ายมา)
      const collectionDeals = await api.getDealsByStep('collection', search)
      setDeals([...legalDeals, ...collectionDeals])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const fetchLegalActions = async () => {
    try {
      const data = await api.getLegalAll()
      setLegalActions(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchDeals(); fetchLegalActions() }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createLegal({ ...form, deal_id: Number(form.deal_id), cost: Number(form.cost) || 0 })
      setForm({ deal_id: '', action_type: 'หนังสือทวงถาม', action_date: '', lawyer_name: '', court_name: '', case_number: '', description: '', cost: '', status: 'ดำเนินการ', next_date: '', notes: '' })
      setShowForm(false)
      fetchLegalActions()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('ลบรายการนี้?')) return
    await api.deleteLegal(id)
    fetchLegalActions()
  }

  const handleMoveDealToLegal = async (dealId) => {
    await api.moveStep(dealId, 'legal')
    fetchDeals()
  }

  const handleCloseToAccounting = async (dealId, resultType) => {
    const msg = resultType === 'won'
      ? 'ยืนยัน จบคดี (ชนะ/ได้เงินคืน) → ส่งบัญชี?'
      : 'ยืนยัน จบคดี (ตัดหนี้สูญ) → ส่งบัญชี?'
    if (!confirm(msg)) return
    await api.updateDeal(dealId, { legal_result: resultType === 'won' ? 'ชนะคดี' : 'ตัดหนี้สูญ' })
    await api.moveStep(dealId, 'accounting')
    fetchDeals()
    fetchLegalActions()
  }

  // Group legal actions by deal
  const groupedByDeal = legalActions.reduce((acc, la) => {
    const key = la.deal_id
    if (!acc[key]) acc[key] = { customer_name: la.customer_name, items: [] }
    acc[key].items.push(la)
    return acc
  }, {})

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Gavel className="text-purple-500" size={28} /> กฎหมาย
          </h1>
          <p className="text-gray-500 mt-1">ดำเนินการทางกฎหมาย — ทวงถาม, ฟ้องร้อง, บังคับคดี</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          <Plus size={20} /> เพิ่มรายการกฎหมาย
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">เพิ่มรายการทางกฎหมาย</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลือก Deal / ลูกค้า *</label>
              <select value={form.deal_id} onChange={(e) => setForm({ ...form, deal_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                <option value="">-- เลือก --</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.customer_name} ({d.product_type}) - ฿{(d.approved_amount || d.amount)?.toLocaleString()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท *</label>
              <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                <option>หนังสือทวงถาม</option>
                <option>หนังสือบอกเลิกสัญญา</option>
                <option>ฟ้องคดีแพ่ง</option>
                <option>ฟ้องคดีอาญา</option>
                <option>ยื่นคำร้องบังคับคดี</option>
                <option>อายัดทรัพย์</option>
                <option>ไกล่เกลี่ย</option>
                <option>ประนีประนอม</option>
                <option>อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ดำเนินการ *</label>
              <input type="date" value={form.action_date} onChange={(e) => setForm({ ...form, action_date: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ทนายความ</label>
              <input type="text" value={form.lawyer_name} onChange={(e) => setForm({ ...form, lawyer_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ศาล</label>
              <input type="text" value={form.court_name} onChange={(e) => setForm({ ...form, court_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" placeholder="เช่น ศาลแพ่งกรุงเทพใต้" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขคดี</label>
              <input type="text" value={form.case_number} onChange={(e) => setForm({ ...form, case_number: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค่าใช้จ่าย (฿)</label>
              <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                <option>ดำเนินการ</option>
                <option>รอนัดศาล</option>
                <option>อยู่ระหว่างพิจารณา</option>
                <option>ชนะคดี</option>
                <option>แพ้คดี</option>
                <option>ประนีประนอม</option>
                <option>จบ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">นัดหมายครั้งถัดไป</label>
              <input type="date" value={form.next_date} onChange={(e) => setForm({ ...form, next_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" placeholder="รายละเอียดการดำเนินการ"></textarea>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">บันทึก</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาลูกค้า..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      {/* Export */}
      <div className="flex gap-2 mb-4">
        <a href="/api/export/deals?step=legal" download className="text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export คดี</a>
        <a href="/api/export/legal" download className="text-sm text-purple-700 border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-50">📥 Export การดำเนินการ</a>
      </div>

      {/* Deals ที่อยู่ในขั้น collection - สามารถส่งมาหน้ากฎหมายได้ */}
      {deals.filter(d => d.current_step === 'collection').length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ รายการรอส่งทางกฎหมาย (จากขั้นติดตามหนี้)</h3>
          <div className="space-y-2">
            {deals.filter(d => d.current_step === 'collection').map(deal => (
              <div key={deal.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border">
                <span className="text-sm">{deal.customer_name} — ฿{(deal.approved_amount || deal.amount)?.toLocaleString()}</span>
                <button onClick={() => handleMoveDealToLegal(deal.id)} className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                  ส่งดำเนินคดี →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Actions List */}
      {loading ? <div className="text-center py-8 text-gray-400">กำลังโหลด...</div> : (
        deals.filter(d => d.current_step === 'legal').length === 0 && Object.keys(groupedByDeal).length === 0 ? (
          <div className="text-center py-8 text-gray-400">ยังไม่มีรายการทางกฎหมาย</div>
        ) : (
          <div className="space-y-6">
            {/* Deals ที่อยู่ step legal */}
            {deals.filter(d => d.current_step === 'legal').map((deal) => {
              const dealLegalActions = legalActions.filter(la => la.deal_id === deal.id)
              return (
                <div key={deal.id} className="bg-white rounded-xl shadow-sm border">
                  <div className="p-4 border-b bg-purple-50 rounded-t-xl flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-900">{deal.customer_name}</h3>
                      <p className="text-xs text-purple-700 mt-0.5">
                        {deal.product_type} | วงเงิน: ฿{(deal.approved_amount || deal.amount)?.toLocaleString()}
                        {dealLegalActions.length > 0 && ` | ${dealLegalActions.length} การดำเนินการ | ค่าใช้จ่าย: ฿${dealLegalActions.reduce((s, i) => s + (i.cost || 0), 0).toLocaleString()}`}
                      </p>
                    </div>
                    <button onClick={() => { setForm({ ...form, deal_id: String(deal.id) }); setShowForm(true) }} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-700">
                      <Plus size={12} /> เพิ่มการดำเนินการ
                    </button>
                  </div>

                  {/* Legal actions ของ deal นี้ */}
                  {dealLegalActions.length > 0 && (
                    <div className="divide-y">
                      {dealLegalActions.map((la) => (
                        <div key={la.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{la.action_type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  la.status === 'ชนะคดี' || la.status === 'จบ' ? 'bg-green-100 text-green-700' :
                                  la.status === 'แพ้คดี' ? 'bg-red-100 text-red-700' :
                                  la.status === 'รอนัดศาล' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>{la.status}</span>
                                <span className="text-xs text-gray-500">📅 {la.action_date}</span>
                              </div>
                              {la.description && <p className="text-sm text-gray-700 mt-1">{la.description}</p>}
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                {la.lawyer_name && <span>👤 ทนาย: {la.lawyer_name}</span>}
                                {la.court_name && <span>🏛️ ศาล: {la.court_name}</span>}
                                {la.case_number && <span>📋 คดี: {la.case_number}</span>}
                                {la.cost > 0 && <span className="text-red-600 font-medium">💰 ค่าใช้จ่าย: ฿{la.cost?.toLocaleString()}</span>}
                                {la.next_date && <span className="text-blue-600 font-medium">📆 นัดถัดไป: {la.next_date}</span>}
                              </div>
                            </div>
                            <button onClick={() => handleDelete(la.id)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {dealLegalActions.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400">ยังไม่มีการดำเนินการ — กดปุ่ม "เพิ่มการดำเนินการ" เพื่อบันทึก</div>
                  )}

                  {/* ปุ่มจบคดี → ส่งบัญชี */}
                  <div className="p-4 border-t bg-gray-50 rounded-b-xl flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">จบคดี:</span>
                    <button
                      onClick={() => handleCloseToAccounting(deal.id, 'won')}
                      className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm"
                    >
                      <CheckCircle2 size={14} /> ชนะคดี / ได้เงินคืน → บัญชี <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => handleCloseToAccounting(deal.id, 'lost')}
                      className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                    >
                      <Ban size={14} /> ตัดหนี้สูญ → บัญชี <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

export default Legal
