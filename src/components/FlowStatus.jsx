import React from 'react'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'

const steps = [
  { key: 'telesale', label: 'Telesale' },
  { key: 'sale', label: 'Sale' },
  { key: 'credit_analysis', label: 'พิจารณา' },
  { key: 'approved', label: 'อนุมัติ' },
  { key: 'contract', label: 'นิติกรรม' },
  { key: 'disbursed', label: 'เบิกจ่าย' },
  { key: 'collection', label: 'ติดตาม' },
  { key: 'legal', label: 'กฎหมาย' },
  { key: 'accounting', label: 'บัญชี' },
]

function FlowStatus({ currentStep }) {
  const currentIdx = steps.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx
        const isCurrent = idx === currentIdx
        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              isDone ? 'bg-green-100 text-green-700' :
              isCurrent ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300' :
              'bg-gray-100 text-gray-400'
            }`}>
              {isDone ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight size={12} className={isDone ? 'text-green-400' : 'text-gray-300'} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default FlowStatus
