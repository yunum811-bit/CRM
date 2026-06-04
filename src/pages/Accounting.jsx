import React, { useState, useEffect, useRef } from 'react'
import { Search, Calculator, CheckCircle2, Printer, X } from 'lucide-react'
import { api } from '../api'
import DealCard from '../components/DealCard'

function Accounting() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [printDeal, setPrintDeal] = useState(null)
  const printRef = useRef(null)

  const fetchData = () => { setLoading(true); api.getDealsByStep('accounting', search).then(setDeals).catch(console.error).finally(() => setLoading(false)) }
  useEffect(() => { fetchData() }, [search])

  const handleClose = async (id) => {
    await api.updateDeal(id, { closed_at: new Date().toISOString().split('T')[0], current_step: 'closed' })
    fetchData()
  }

  const handlePrint = (deal) => {
    setPrintDeal(deal)
    setTimeout(() => {
      const content = printRef.current
      if (!content) return
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      printWindow.document.write(`
        <html>
        <head>
          <title>ใบเสร็จรับเงิน - ${deal.customer_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; }
            .receipt { max-width: 700px; margin: 0 auto; border: 2px solid #166534; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; color: #166534; }
            .header p { font-size: 14px; color: #666; margin-top: 5px; }
            .receipt-no { text-align: right; font-size: 14px; color: #666; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
            .info-item label { font-size: 12px; color: #888; display: block; }
            .info-item span { font-size: 15px; font-weight: 600; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; font-size: 14px; }
            .table th { background: #f0fdf4; color: #166534; font-weight: 600; }
            .table .right { text-align: right; }
            .total-row { background: #f0fdf4; font-weight: 700; font-size: 16px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .sign-box { text-align: center; width: 200px; }
            .sign-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; font-size: 13px; }
            .note { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px dashed #ccc; padding-top: 15px; }
            @media print { body { padding: 20px; } .receipt { border: none; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `)
      printWindow.document.close()
      setPrintDeal(null)
    }, 100)
  }

  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  const receiptNo = (deal) => `RCP-${new Date().getFullYear()}-${String(deal.id).padStart(4, '0')}`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2"><Calculator className="text-emerald-500" size={28} /> บัญชี</h1>
        <p className="text-gray-500 mt-1">บันทึกบัญชี ปิดรายการ ออกใบเสร็จ</p>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-emerald-700">รายการที่ชำระครบแล้ว รอบันทึกบัญชีและปิดรายการ</p>
      </div>
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="mb-4">
        <a href="/api/export/deals?step=accounting" download className="inline-flex items-center gap-1.5 text-sm text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">📥 Export CSV</a>
      </div>
      <div className="space-y-3">
        {loading && <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>}
        {!loading && deals.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีรายการรอปิดบัญชี</div>}
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} step="accounting" actions={
            <div className="flex flex-col gap-2">
              <button onClick={() => handlePrint(deal)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                <Printer size={14} /> พิมพ์ใบเสร็จ
              </button>
              <button onClick={() => handleClose(deal.id)} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm whitespace-nowrap">
                <CheckCircle2 size={14} /> ปิดรายการ
              </button>
            </div>
          }>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-1">
              <p className="text-gray-700">ยอดรวม: <strong>฿ {(deal.approved_amount || deal.amount)?.toLocaleString()}</strong></p>
              {deal.interest_rate > 0 && <p className="text-gray-600">ดอกเบี้ย: {deal.interest_rate}%</p>}
              {deal.disbursed_at && <p className="text-gray-600">เบิกจ่าย: {deal.disbursed_at}</p>}
              {deal.paid_at && <p className="text-gray-600">ชำระ: {deal.paid_at}</p>}
              {deal.legal_result && <p className="text-purple-600">ผลคดี: {deal.legal_result}</p>}
            </div>
          </DealCard>
        ))}
      </div>

      {/* Hidden Print Template */}
      {printDeal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setPrintDeal(null)}>
          <div className="bg-white rounded-xl p-2 max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-2">
              <button onClick={() => setPrintDeal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div ref={printRef}>
              <div className="receipt">
                <div className="header">
                  <h1>ใบเสร็จรับเงิน</h1>
                  <p>SerialFac Co., Ltd. — ระบบบริหารสินเชื่อ</p>
                </div>
                <div className="receipt-no">
                  <p>เลขที่: {receiptNo(printDeal)}</p>
                  <p>วันที่: {today}</p>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ลูกค้า</label>
                    <span>{printDeal.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <label>ประเภทสินเชื่อ</label>
                    <span>{printDeal.product_type}</span>
                  </div>
                  <div className="info-item">
                    <label>เบอร์โทร</label>
                    <span>{printDeal.phone || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>วันที่เบิกจ่าย</label>
                    <span>{printDeal.disbursed_at || '-'}</span>
                  </div>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>รายการ</th>
                      <th className="right">จำนวนเงิน (฿)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>วงเงินอนุมัติ</td>
                      <td className="right">{(printDeal.approved_amount || printDeal.amount)?.toLocaleString()}</td>
                    </tr>
                    {printDeal.interest_deducted > 0 && (
                      <tr>
                        <td>ดอกเบี้ยหักล่วงหน้า ({printDeal.interest_rate}% × {printDeal.term_months} เดือน)</td>
                        <td className="right">-{printDeal.interest_deducted?.toLocaleString()}</td>
                      </tr>
                    )}
                    {printDeal.net_disbursement > 0 && (
                      <tr>
                        <td>ยอดจ่ายจริงให้ลูกค้า</td>
                        <td className="right">{printDeal.net_disbursement?.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="total-row">
                      <td>ยอดเงินต้นที่ชำระคืน</td>
                      <td className="right">{(printDeal.approved_amount || printDeal.amount)?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                {printDeal.paid_at && (
                  <p style={{fontSize: '14px', marginTop: '10px'}}>วันที่ชำระ: <strong>{printDeal.paid_at}</strong></p>
                )}
                {printDeal.legal_result && (
                  <p style={{fontSize: '14px', marginTop: '5px'}}>ผลทางกฎหมาย: <strong>{printDeal.legal_result}</strong></p>
                )}
                <div className="footer">
                  <div className="sign-box">
                    <div className="sign-line">ผู้รับเงิน</div>
                  </div>
                  <div className="sign-box">
                    <div className="sign-line">ผู้จ่ายเงิน</div>
                  </div>
                </div>
                <div className="note">
                  เอกสารนี้ออกโดยระบบ SerialFac CRM — สำหรับใช้เป็นหลักฐานภายในเท่านั้น
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 p-4 border-t">
              <button onClick={() => handlePrint(printDeal)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <Printer size={16} /> พิมพ์
              </button>
              <button onClick={() => setPrintDeal(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounting
