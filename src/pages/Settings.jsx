import React, { useState, useEffect, useRef } from 'react'
import { Users, Shield, Plus, Edit, Trash2, X, Save, Check, Building2, Upload } from 'lucide-react'
import { api } from '../api'

const ALL_PAGES = [
  { key: 'dashboard', label: 'แดชบอร์ด' },
  { key: 'telesale', label: 'Telesale' },
  { key: 'sale', label: 'Sale' },
  { key: 'credit-analysis', label: 'พิจารณาสินเชื่อ' },
  { key: 'approval', label: 'อนุมัติ' },
  { key: 'contract', label: 'นิติกรรมสัญญา' },
  { key: 'disbursement', label: 'เบิกจ่าย' },
  { key: 'collection', label: 'ติดตามหนี้' },
  { key: 'legal', label: 'กฎหมาย' },
  { key: 'accounting', label: 'บัญชี' },
  { key: 'customers', label: 'ลูกค้า' },
  { key: 'settings', label: 'ตั้งค่า' },
]

function Settings() {
  const [tab, setTab] = useState('company')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  // Company settings
  const [companySettings, setCompanySettings] = useState({ company_name: '', company_subtitle: '', logo_url: '' })
  const [companyForm, setCompanyForm] = useState({ company_name: '', company_subtitle: '' })
  const [companySaving, setCompanySaving] = useState(false)
  const logoInputRef = useRef(null)

  // User form
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [userForm, setUserForm] = useState({ username: '', password: '', full_name: '', role_id: '' })

  // Role editing
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [rolePages, setRolePages] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [u, r, cs] = await Promise.all([api.getUsers(), api.getRoles(), api.getCompanySettings()])
      setUsers(u)
      setRoles(r)
      setCompanySettings(cs)
      setCompanyForm({ company_name: cs.company_name || '', company_subtitle: cs.company_subtitle || '' })
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // === USERS ===
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      if (editingUserId) {
        await api.updateUser(editingUserId, userForm)
      } else {
        await api.createUser(userForm)
      }
      setShowUserForm(false)
      setEditingUserId(null)
      setUserForm({ username: '', password: '', full_name: '', role_id: '' })
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEditUser = (user) => {
    setEditingUserId(user.id)
    setUserForm({ username: user.username, password: '', full_name: user.full_name, role_id: user.role_id })
    setShowUserForm(true)
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('ยืนยันลบผู้ใช้นี้?')) return
    await api.deleteUser(id)
    fetchData()
  }

  // === ROLES ===
  const handleEditRole = (role) => {
    setEditingRoleId(role.id)
    setRolePages(role.pages || [])
  }

  const handleTogglePage = (page) => {
    setRolePages(prev => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page])
  }

  const handleSaveRole = async () => {
    await api.updateRolePermissions(editingRoleId, rolePages)
    setEditingRoleId(null)
    fetchData()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-2">⚙️ ตั้งค่าระบบ</h1>
      <p className="text-green-600 mb-6">จัดการผู้ใช้งาน และสิทธิ์การเข้าถึง</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/80 rounded-xl p-1 border border-green-100 w-fit">
        <button
          onClick={() => setTab('company')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium transition-all ${
            tab === 'company' ? 'bg-green-700 text-white shadow' : 'text-green-700 hover:bg-green-50'
          }`}
        >
          <Building2 size={18} /> บริษัท
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium transition-all ${
            tab === 'users' ? 'bg-green-700 text-white shadow' : 'text-green-700 hover:bg-green-50'
          }`}
        >
          <Users size={18} /> ผู้ใช้งาน
        </button>
        <button
          onClick={() => setTab('roles')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium transition-all ${
            tab === 'roles' ? 'bg-green-700 text-white shadow' : 'text-green-700 hover:bg-green-50'
          }`}
        >
          <Shield size={18} /> สิทธิ์ (Roles)
        </button>
      </div>

      {/* TAB: Company */}
      {tab === 'company' && (
        <div className="bg-white rounded-xl border border-green-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ตั้งค่าบริษัท</h2>

          {/* Logo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">โลโก้บริษัท</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center overflow-hidden bg-green-50">
                {companySettings.logo_url ? (
                  <img src={companySettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={32} className="text-green-300" />
                )}
              </div>
              <div>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  <Upload size={16} /> อัพโหลดโลโก้
                </button>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (แนะนำ 200x200px)</p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = async (ev) => {
                      try {
                        const result = await api.uploadLogo(ev.target.result)
                        setCompanySettings({ ...companySettings, logo_url: result.logo_url })
                        alert('อัพโหลดโลโก้สำเร็จ')
                      } catch (err) { alert('อัพโหลดไม่สำเร็จ: ' + err.message) }
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท</label>
              <input
                type="text"
                value={companyForm.company_name}
                onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="ชื่อบริษัท"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย (Subtitle)</label>
              <input
                type="text"
                value={companyForm.company_subtitle}
                onChange={(e) => setCompanyForm({ ...companyForm, company_subtitle: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="เช่น CRM ระบบสินเชื่อ"
              />
            </div>
          </div>
          <button
            onClick={async () => {
              setCompanySaving(true)
              try {
                const updated = await api.updateCompanySettings(companyForm)
                setCompanySettings(updated)
                alert('บันทึกสำเร็จ')
              } catch (err) { alert(err.message) }
              setCompanySaving(false)
            }}
            disabled={companySaving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={16} /> {companySaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      )}

      {/* TAB: Users */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">รายชื่อผู้ใช้งาน ({users.length})</h2>
            <button
              onClick={() => { setShowUserForm(true); setEditingUserId(null); setUserForm({ username: '', password: '', full_name: '', role_id: roles[0]?.id || '' }) }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus size={16} /> เพิ่มผู้ใช้
            </button>
          </div>

          {/* User Form */}
          {showUserForm && (
            <form onSubmit={handleCreateUser} className="bg-white rounded-xl border border-green-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingUserId ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h3>
                <button type="button" onClick={() => { setShowUserForm(false); setEditingUserId(null) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input type="text" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน {editingUserId ? '(ว่าง = ไม่เปลี่ยน)' : '*'}</label>
                  <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required={!editingUserId} className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={userForm.role_id} onChange={(e) => setUserForm({ ...userForm, role_id: Number(e.target.value) })} required className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                    <option value="">-- เลือก Role --</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.label} ({r.name})</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">{editingUserId ? 'อัพเดท' : 'สร้างผู้ใช้'}</button>
                <button type="button" onClick={() => { setShowUserForm(false); setEditingUserId(null) }} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-medium text-green-800">ชื่อ</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-green-800">Username</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-green-800">Role</th>
                  <th className="text-center px-5 py-3 text-sm font-medium text-green-800">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-green-50/50">
                    <td className="px-5 py-3 font-medium text-gray-800">{user.full_name}</td>
                    <td className="px-5 py-3 text-gray-600">{user.username}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{user.role_label || user.role}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditUser(user)} className="text-yellow-600 hover:text-yellow-800"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Roles */}
      {tab === 'roles' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">สิทธิ์การเข้าถึงแต่ละ Role</h2>
          <p className="text-sm text-gray-500 mb-4">กดที่ "แก้ไขสิทธิ์" เพื่อเปลี่ยนหน้าที่แต่ละ Role เข้าถึงได้</p>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl border border-green-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{role.label}</h3>
                    <p className="text-sm text-gray-500">({role.name}) — {role.pages?.length || 0} หน้า</p>
                  </div>
                  {editingRoleId === role.id ? (
                    <div className="flex gap-2">
                      <button onClick={handleSaveRole} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                        <Save size={14} /> บันทึก
                      </button>
                      <button onClick={() => setEditingRoleId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">ยกเลิก</button>
                    </div>
                  ) : (
                    <button onClick={() => handleEditRole(role)} className="flex items-center gap-1 text-sm text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50">
                      <Edit size={14} /> แก้ไขสิทธิ์
                    </button>
                  )}
                </div>

                {/* Show current permissions */}
                {editingRoleId === role.id ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {ALL_PAGES.map((page) => {
                      const isChecked = rolePages.includes(page.key)
                      return (
                        <label key={page.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all ${
                          isChecked ? 'bg-green-100 border-green-400 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePage(page.key)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-sm">{page.label}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(role.pages || []).map((page) => {
                      const pageInfo = ALL_PAGES.find(p => p.key === page)
                      return (
                        <span key={page} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <Check size={10} /> {pageInfo?.label || page}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
