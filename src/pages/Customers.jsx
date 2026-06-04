import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, X, Building2, Phone, Mail } from 'lucide-react'
import { api } from '../api'

function Customers() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '', tax_id: '', type: 'บริษัท', contact_person: '', phone: '', email: '', address: '', total_credit: ''
  })

  const fetchData = () => {
    setLoading(true)
    api.getCustomers(search).then(setData).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  const resetForm = () => {
    setForm({ name: '', tax_id: '', type: 'บริษัท', contact_person: '', phone: '', email: '', address: '', total_credit: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, total_credit: Number(form.total_credit) || 0 }
      if (editingId) {
        await api.updateCustomer(editingId, payload)
      } else {
        await api.createCustomer(payload)
      }
      resetForm()
      fetchData()
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    }
  }

  const handleEdit = (item) => {
    setForm({
      name: item.name, tax_id: item.tax_id || '', type: item.type,
      contact_person: item.contact_person || '', phone: item.phone || '',
      email: item.email || '', address: item.address || '', total_credit: item.total_credit || ''
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันการลบลูกค้า? (รายการที่เกี่ยวข้องอาจถูกกระทบ)')) return
    try {
      await api.deleteCustomer(id)
      fetchData()
    } catch (err) {
      alert('ไม่สามารถลบได้: ' + err.message)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ลูกค้า (Customers)</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} /> เพิ่มลูกค้าใหม่
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingId ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท / ห้างหุ้นส่วน *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
              <input type="text" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option>บริษัท</option>
                <option>หจก.</option>
                <option>บริษัทมหาชน</option>
                <option>บุคคลธรรมดา</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ติดต่อ</label>
              <input type="text" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">โทรศัพท์</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วงเงินรวม (฿)</label>
              <input type="number" value={form.total_credit} onChange={(e) => setForm({ ...form, total_credit: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
              <textarea rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">{editingId ? 'อัพเดท' : 'บันทึก'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อบริษัท, เลขภาษี, ผู้ติดต่อ..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="mb-4">
        <a href="/api/export/customers" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>

      {loading ? <div className="p-8 text-center text-gray-400">กำลังโหลด...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Building2 size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">Tax ID: {item.tax_id || '-'}</p>
                  </div>
                </div>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">{item.type}</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{item.contact_person || '-'} {item.phone ? `- ${item.phone}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span>{item.email || '-'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">วงเงินรวม</p>
                  <p className="font-semibold text-gray-800">฿ {(item.total_credit || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEdit(item)} className="flex-1 text-center py-2 text-sm text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-50">
                  <Edit size={14} className="inline mr-1" /> แก้ไข
                </button>
                <button onClick={() => handleDelete(item.id)} className="py-2 px-3 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="col-span-2 text-center py-8 text-gray-400">ไม่พบลูกค้า</div>}
        </div>
      )}
    </div>
  )
}

export default Customers
