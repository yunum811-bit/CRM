import React from 'react'
import { Download } from 'lucide-react'

function ExportButton({ href, label = 'Export CSV' }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
    >
      <Download size={14} /> {label}
    </a>
  )
}

export default ExportButton
