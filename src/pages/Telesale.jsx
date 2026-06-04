import React, { useState, useEffect } from 'react'
import { Plus, Search, PhoneCall, ArrowRight, X, Phone, PhoneMissed, Calendar, Clock, Trash2 } from 'lucide-react'
import { api } from '../api'
import FlowStatus from '../components/FlowStatus'

function Telesale() {
  const [deals, setDeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    customer_name: '', phone: '', product_type: 'Factoring', interest_level: 'สนใจ', notes: ''
  })

  // Call log state
  const [expandedId, setExpandedId] = useState(null)
  const [callLogs, setCallLogs] = useState([])
  const [showCallForm, setShowCallForm] = useState(false)
  const [callForm, setCallForm] = useState({
    call_result: 'นัดสำเร็จ', appointment_date: '', appointment_time: '', contact_person: '', notes: ''
  })

  const fetchData = () => {
    setLoading(true)
    api.getDealsByStep('telesale', search).then(setDeals).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  const loadCallLogs = async (dealId) => {
    const data = await api.getCallLogsByDeal(dealId)
    setCallLogs(data)
  }

  const handleExpand = (dealId) => {
    if (expandedId === dealId) { setExpandedId(null); return }
    setExpandedId(dealId)
    loadCallLogs(dealId)
    setShowCallForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createDeal({ ...form, current_step: 'telesale' })
      setForm({ customer_name: '', phone: '', product_type: 'Factoring', interest_level: 'สนใจ', notes: '' })
      setShowForm(false)
      fetchData()
    } catch (err) { alert('เกิดข้อผิดพลาด: ' + err.message) }
  }

  // บันทึกผลการโทร
  const handleSaveCallLog = async (dealId) => {
    try {
      await api.createCallLog({
        deal_id: dealId,
        call_date: new Date().toISOString().split('T')[0],
        ...callForm
      })
      setCallForm({ call_result: 'นัดสำเร็จ', appointment_date: '', appointment_time: '', contact_person: '', notes: '' })
      setShowCallForm(false)
      loadCallLogs(dealId)
    } catch (err) { alert(err.message) }
  }

  // นัดสำเร็จ → ส่ง Sale
  const handleAppointmentSuccess = async (dealId) => {
    if (!confirm('ยืนยัน นัดลูกค้าสำเร็จ → ส่งต่อ Sale?')) return
    // บันทึก log อัตโนมัติ
    await api.createCallLog({
      deal_id: dealId,
      call_date: new Date().toISOString().split('T')[0],
      call_result: 'นัดสำเร็จ',
      notes: 'นัดสำเร็จ - ส่งต่อ Sale'
    })
    await api.moveStep(dealId, 'sale')
    fetchData()
  }

  const handleDeleteLog = async (logId, dealId) => {
    if (!confirm('ลบ?')) return
    await api.deleteCallLog(logId)
    loadCallLogs(dealId)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <PhoneCall className="text-cyan-500" size={28} /> Telesale
          </h1>
          <p className="text-gray-500 mt-1">โทรติดต่อลูกค้า นัดหมาย ส่งต่อ Sale เมื่อนัดสำเร็จ</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
          <Plus size={20} /> เพิ่ม Lead ใหม่
        </button>
      </div>

      {/* Export */}
      <div className="flex gap-2 mb-4">
        <a href="/api/export/deals?step=telesale" download className="text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
        <a href="/api/export/call-logs" download className="text-sm text-blue-700 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50">📥 Export บันทึกโทร</a>
      </div>

      {/* New Lead Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">เพิ่ม Lead ใหม่</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อลูกค้า / บริษัท *</label>
              <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ผลิตภัณฑ์ที่สนใจ</label>
              <select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                <option>Factoring</option><option>ขายบิล</option><option>Trade</option><option>Loan</option><option>อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ระดับความสนใจ</label>
              <select value={form.interest_level} onChange={(e) => setForm({ ...form, interest_level: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                <option>สนใจมาก</option><option>สนใจ</option><option>สนใจเล็กน้อย</option><option>ไม่สนใจ</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
              <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"></textarea>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700">บันทึก</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อลูกค้า..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500" />
      </div>

      {/* Deal List */}
      <div className="space-y-4">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่พบรายการ</div>}
        {deals.map((deal) => {
          const isExpanded = expandedId === deal.id
          return (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm border">
              {/* Header */}
              <div className="p-5 cursor-pointer" onClick={() => handleExpand(deal.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">{deal.customer_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">{deal.product_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        deal.interest_level === 'สนใจมาก' ? 'bg-green-100 text-green-700' :
                        deal.interest_level === 'สนใจ' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{deal.interest_level}</span>
                    </div>
                    {deal.phone && <p className="text-sm text-gray-500">📞 {deal.phone}</p>}
                    {deal.notes && <p className="text-sm text-gray-400 mt-1">{deal.notes}</p>}
                    <div className="mt-2"><FlowStatus currentStep="telesale" /></div>
                  </div>
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleAppointmentSuccess(deal.id)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                    >
                      <Calendar size={14} /> นัดสำเร็จ → Sale <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => { handleExpand(deal.id); setTimeout(() => setShowCallForm(true), 100) }}
                      className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 text-sm whitespace-nowrap"
                    >
                      <Phone size={14} /> บันทึกการโทร
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded: Call Logs */}
              {isExpanded && (
                <div className="border-t p-5 bg-cyan-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Phone size={16} className="text-cyan-500" /> บันทึกการโทร / นัดหมาย
                    </h4>
                    <button onClick={() => setShowCallForm(!showCallForm)} className="flex items-center gap-1 bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cyan-600">
                      <Plus size={14} /> เพิ่ม
                    </button>
                  </div>

                  {/* Call Log Form */}
                  {showCallForm && (
                    <div className="bg-white border border-cyan-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ผลการโทร *</label>
                          <select value={callForm.call_result} onChange={(e) => setCallForm({ ...callForm, call_result: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm">
                            <option>นัดสำเร็จ</option>
                            <option>ไม่รับสาย</option>
                            <option>รับแล้ว นัดไม่ได้</option>
                            <option>ขอโทรกลับ</option>
                            <option>เบอร์ผิด</option>
                            <option>ไม่สนใจ</option>
                            <option>ติดต่อไม่ได้</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันนัดหมาย</label>
                          <input type="date" value={callForm.appointment_date} onChange={(e) => setCallForm({ ...callForm, appointment_date: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">เวลานัด</label>
                          <input type="time" value={callForm.appointment_time} onChange={(e) => setCallForm({ ...callForm, appointment_time: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ผู้ที่คุยด้วย</label>
                          <input type="text" value={callForm.contact_person} onChange={(e) => setCallForm({ ...callForm, contact_person: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">หมายเหตุ</label>
                          <input type="text" value={callForm.notes} onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="รายละเอียดเพิ่มเติม" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleSaveCallLog(deal.id)} className="bg-cyan-600 text-white px-4 py-1.5 rounded text-sm hover:bg-cyan-700">บันทึก</button>
                        <button onClick={() => setShowCallForm(false)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm">ยกเลิก</button>
                      </div>
                    </div>
                  )}

                  {/* Call Log List */}
                  {callLogs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีบันทึกการโทร</p>
                  ) : (
                    <div className="space-y-2">
                      {callLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.call_result === 'นัดสำเร็จ' ? 'bg-green-100' :
                            log.call_result === 'ไม่สนใจ' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            {log.call_result === 'นัดสำเร็จ' ? <Calendar size={14} className="text-green-600" /> :
                             log.call_result === 'ไม่รับสาย' || log.call_result === 'ติดต่อไม่ได้' ? <PhoneMissed size={14} className="text-red-500" /> :
                             <Phone size={14} className="text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                log.call_result === 'นัดสำเร็จ' ? 'bg-green-100 text-green-700' :
                                log.call_result === 'ไม่สนใจ' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>{log.call_result}</span>
                              <span className="text-xs text-gray-400">{log.call_date}</span>
                              {log.contact_person && <span className="text-xs text-gray-500">คุยกับ: {log.contact_person}</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {log.appointment_date && (
                                <span className="text-xs text-blue-600 flex items-center gap-1">
                                  <Calendar size={10} /> นัด: {log.appointment_date} {log.appointment_time || ''}
                                </span>
                              )}
                              {log.notes && <span className="text-xs text-gray-500">{log.notes}</span>}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteLog(log.id, deal.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      ))}
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

export default Telesale
