import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Lock, User } from 'lucide-react'

function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
        return
      }

      login(data)
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-300 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl shadow-accent-500/30 mx-auto mb-4">
            <span className="text-brand-800 font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white">SerialFac CRM</h1>
          <p className="text-brand-200 mt-2">ระบบบริหารสินเชื่อ</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-brand-800 text-center mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">ชื่อผู้ใช้</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-200 rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-200 rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3 rounded-xl hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 font-medium transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-700/40"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <div className="mt-6 pt-4 border-t border-brand-100">
            <p className="text-xs text-brand-500 text-center mb-2">ทดลองเข้าสู่ระบบ:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-brand-400">
              <span>admin / admin123</span>
              <span>telesale1 / 1234</span>
              <span>sale1 / 1234</span>
              <span>credit1 / 1234</span>
              <span>ops1 / 1234</span>
              <span>legal1 / 1234</span>
              <span>collect1 / 1234</span>
              <span>acc1 / 1234</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
