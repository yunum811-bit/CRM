import React from 'react'
import { useAuth } from '../context/AuthContext'
import { ShieldX } from 'lucide-react'

function ProtectedRoute({ page, children }) {
  const { hasAccess } = useAuth()

  if (!hasAccess(page)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShieldX size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
