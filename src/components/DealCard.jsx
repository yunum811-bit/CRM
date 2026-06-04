import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import FlowStatus from './FlowStatus'

function DealCard({ deal, step, actions, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/deal/${deal.id}`}
              className="font-semibold text-gray-800 hover:text-indigo-600 hover:underline flex items-center gap-1"
            >
              {deal.customer_name}
              <ExternalLink size={12} className="text-gray-400" />
            </Link>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getProductColor(deal.product_type)}`}>
              {deal.product_type}
            </span>
            {deal.interest_level && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getInterestColor(deal.interest_level)}`}>
                {deal.interest_level}
              </span>
            )}
          </div>
          {children}
          <div className="mt-2">
            <FlowStatus currentStep={step} />
          </div>
        </div>
        {actions && <div className="flex flex-col gap-2">{actions}</div>}
      </div>
    </div>
  )
}

function getProductColor(type) {
  switch (type) {
    case 'Factoring': return 'bg-blue-100 text-blue-700'
    case 'Loan': return 'bg-orange-100 text-orange-700'
    case 'Trade': return 'bg-purple-100 text-purple-700'
    case 'ขายบิล': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getInterestColor(level) {
  switch (level) {
    case 'สนใจมาก': return 'bg-green-100 text-green-700'
    case 'สนใจ': return 'bg-blue-100 text-blue-700'
    case 'สนใจเล็กน้อย': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export default DealCard
