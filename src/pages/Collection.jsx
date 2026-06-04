import React, { useState, useEffect } from 'react'
import { Search, Clock, ArrowRight, Truck, Gavel, Plus, Trash2 } from 'lucide-react'
import { api } from '../api'
import FlowStatus from '../components/FlowStatus'

function Collection() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedDeal, setExpandedDeal] = useState(null)
  const [messengerData, setMessengerData] = useState([])
  const [showMessengerForm, setShowMessengerForm] = useState(false)
  const [messengerForm, setMessengerForm] = useState({
    messenger_name: '', trip_date: '', destination: '', distance_km: '', travel_cost: '', other_cost: '', notes: ''
  })

  const fetchData = () => {
    setLoading(true)
    api.getDealsByStep('collection', search).then(setDeals).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  const loadMessenger = async (dealId) => {
    const data = await api.getMessengerByDeal(dealId)
    setMessengerData(data)
  }

  const handleExpand = (dealId) => {
    if (expandedDeal === dealId) { setExpandedDeal(null); return }
    setExpandedDeal(dealId)
    loadMessenger(dealId)
  }

  const handleComplete = async (id) => {
    if (!confirm('ยืนยัน ลูกค้าชำระเงินครบแล้ว?')) return
    await api.updateDeal(id, { paid_at: new Date().toISOString().split('T')[0] })
    await api.moveStep(id, 'accounting')
    fetchData()
  }

  const handleSendToLegal = async (id) => {
    if (!confirm('ยืนยันส่งดำเนินการทางกฎหมาย?')) return
    await api.moveStep(id, 'legal')
    fetchData()
  }

  // Messenger
  const handleAddMessenger = async (dealId) => {
    try {
      await api.createMessenger({ ...messengerForm, deal_id: dealId, distance_km: Number(messengerForm.distance_km) || 0, travel_cost: Number(messengerForm.travel_cost) || 0, other_cost: Number(messengerForm.other_cost) || 0 })
      setMessengerForm({ messenger_name: '', trip_date: '', destination: '', distance_km: '', travel_cost: '', other_cost: '', notes: '' })
      setShowMessengerForm(false)
      loadMessenger(dealId)
    } catch (err) { alert(err.message) }
  }

  const handleDeleteMessenger = async (id, dealId) => {
    if (!confirm('ลบรายการนี้?')) return
    await api.deleteMessenger(id)
    loadMessenger(dealId)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="text-red-500" size={28} /> ติดตามหนี้
        </h1>
        <p className="text-gray-500 mt-1">ติดตามการชำระเงิน + บันทึกค่าเดินทาง Messenger</p>
      </div>

      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
      </div>

      {/* Export */}
      <div className="flex gap-2 mb-4">
        <a href="/api/export/deals?step=collection" download className="text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export ติดตามหนี้</a>
        <a href="/api/export/messenger" download className="text-sm text-orange-700 border border-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-50">📥 Export Messenger</a>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการรอติดตาม</div>}
        {deals.map((deal) => {
          const principal = deal.approved_amount || deal.amount
          const isExpanded = expandedDeal === deal.id

          return (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm border">
              {/* Header */}
              <div className="p-5 cursor-pointer" onClick={() => handleExpand(deal.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{deal.customer_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{deal.product_type}</span>
                      {deal.disbursed_at && <span className="text-xs text-gray-500">เบิกจ่าย: {deal.disbursed_at}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">เงินต้น: <strong>฿ {principal?.toLocaleString()}</strong></span>
                      {deal.interest_deducted > 0 && <span className="text-red-600">หักดอกเบี้ย: ฿{deal.interest_deducted?.toLocaleString()}</span>}
                      {deal.net_disbursement > 0 && <span className="text-green-600">จ่ายจริง: ฿{deal.net_disbursement?.toLocaleString()}</span>}
                    </div>
                    <div className="mt-2"><FlowStatus currentStep="collection" /></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleComplete(deal.id) }}
                      className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm whitespace-nowrap"
                    >
                      ชำระแล้ว → บัญชี <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSendToLegal(deal.id) }}
                      className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap"
                    >
                      <Gavel size={14} /> ส่งกฎหมาย
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded: Messenger Section */}
              {isExpanded && (
                <div className="border-t p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2"><Truck size={16} className="text-orange-500" /> ค่าเดินทาง Messenger</h4>
                    <button onClick={() => setShowMessengerForm(!showMessengerForm)} className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-600">
                      <Plus size={14} /> เพิ่มรายการ
                    </button>
                  </div>

                  {showMessengerForm && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อ Messenger *</label>
                          <input type="text" value={messengerForm.messenger_name} onChange={(e) => setMessengerForm({ ...messengerForm, messenger_name: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เดินทาง *</label>
                          <input type="date" value={messengerForm.trip_date} onChange={(e) => setMessengerForm({ ...messengerForm, trip_date: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ปลายทาง</label>
                          <input type="text" value={messengerForm.destination} onChange={(e) => setMessengerForm({ ...messengerForm, destination: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ระยะทาง (กม.)</label>
                          <input type="number" value={messengerForm.distance_km} onChange={(e) => setMessengerForm({ ...messengerForm, distance_km: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ค่าเดินทาง (฿)</label>
                          <input type="number" value={messengerForm.travel_cost} onChange={(e) => setMessengerForm({ ...messengerForm, travel_cost: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ค่าใช้จ่ายอื่น (฿)</label>
                          <input type="number" value={messengerForm.other_cost} onChange={(e) => setMessengerForm({ ...messengerForm, other_cost: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">หมายเหตุ</label>
                          <input type="text" value={messengerForm.notes} onChange={(e) => setMessengerForm({ ...messengerForm, notes: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleAddMessenger(deal.id)} className="bg-orange-500 text-white px-4 py-1.5 rounded text-sm hover:bg-orange-600">บันทึก</button>
                        <button onClick={() => setShowMessengerForm(false)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm">ยกเลิก</button>
                      </div>
                    </div>
                  )}

                  {messengerData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีรายการ Messenger</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-xs text-gray-500">วันที่</th>
                            <th className="text-left px-3 py-2 text-xs text-gray-500">Messenger</th>
                            <th className="text-left px-3 py-2 text-xs text-gray-500">ปลายทาง</th>
                            <th className="text-right px-3 py-2 text-xs text-gray-500">ระยะทาง</th>
                            <th className="text-right px-3 py-2 text-xs text-gray-500">ค่าเดินทาง</th>
                            <th className="text-right px-3 py-2 text-xs text-gray-500">ค่าอื่น</th>
                            <th className="text-right px-3 py-2 text-xs text-gray-500">รวม</th>
                            <th className="text-center px-3 py-2 text-xs text-gray-500">สถานะ</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {messengerData.map((m) => (
                            <tr key={m.id}>
                              <td className="px-3 py-2">{m.trip_date}</td>
                              <td className="px-3 py-2">{m.messenger_name}</td>
                              <td className="px-3 py-2 text-gray-600">{m.destination || '-'}</td>
                              <td className="px-3 py-2 text-right">{m.distance_km} กม.</td>
                              <td className="px-3 py-2 text-right">฿{m.travel_cost?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right">฿{m.other_cost?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right font-semibold">฿{m.total_cost?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'จ่ายแล้ว' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span>
                              </td>
                              <td className="px-3 py-2">
                                <button onClick={() => handleDeleteMessenger(m.id, deal.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-orange-50">
                          <tr>
                            <td colSpan="6" className="px-3 py-2 text-right font-medium text-orange-800">รวมทั้งหมด:</td>
                            <td className="px-3 py-2 text-right font-bold text-orange-800">฿{messengerData.reduce((sum, m) => sum + (m.total_cost || 0), 0).toLocaleString()}</td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
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

export default Collection
